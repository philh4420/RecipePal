'use server';
/**
 * @fileOverview A Genkit flow for importing a recipe from a URL.
 *
 * This flow takes a URL, sends it to a generative model, and asks the model
 * to extract structured recipe information from the web page. Imported recipes
 * always use an AI-generated image.
 */

import { ai } from '@/ai/genkit';
import {
  ImportRecipeInput,
  ImportRecipeInputSchema,
  ImportRecipeOutput,
  ImportRecipeOutputSchema,
} from '@/ai/types';
import { generateRecipeImage } from './generate-recipe-image-flow';

const IMAGE_FETCH_TIMEOUT_MS = 6000;
const MAX_IMAGE_CANDIDATES = 12;

const POSITIVE_HINTS = [
  'recipe',
  'hero',
  'featured',
  'feature',
  'main',
  'primary',
  'lead',
  'post',
  'article',
  'wp-post-image',
  'post-thumbnail',
  'entry-image',
  'recipe-image',
  'food',
  'dish',
  'meal',
  'cook',
  'gallery',
];

const NEGATIVE_HINTS = [
  'logo',
  'icon',
  'sprite',
  'avatar',
  'profile',
  'author',
  'advert',
  'ads',
  'banner',
  'promo',
  'sidebar',
  'nav',
  'thumbnail',
  'thumb',
  'favicon',
  'emoji',
  'badge',
  'rating',
  'star',
  'spinner',
  'loader',
  'blank',
  'placeholder',
  'spacer',
  'pixel',
  'tracking',
];

const IMAGE_META_KEYS = new Set([
  'og:image',
  'og:image:url',
  'og:image:secure_url',
  'twitter:image',
  'twitter:image:src',
  'image',
  'image:url',
  'image:secure_url',
]);

const htmlEntityDecode = (value: string) => value.replace(/&amp;/g, '&');

const parseTagAttributes = (tag: string) => {
  const attributes: Record<string, string> = {};
  const attrRegex = /(\w[\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match: RegExpExecArray | null = null;
  while ((match = attrRegex.exec(tag))) {
    const key = match[1]?.toLowerCase();
    if (!key) continue;
    attributes[key] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attributes;
};

const normalizeImageCandidate = (candidate: string, baseUrl: string) => {
  const cleaned = htmlEntityDecode(candidate.trim())
    .replace(/^url\((.*)\)$/i, '$1')
    .replace(/^['"]|['"]$/g, '');

  if (!cleaned) return null;

  const token = cleaned.split(/\s+/)[0]?.split(',')[0];
  if (!token) return null;

  if (token.startsWith('data:')) return token;
  if (token.startsWith('//')) {
    return `https:${token}`;
  }

  try {
    return new URL(token, baseUrl).toString();
  } catch {
    return null;
  }
};

const buildHintText = (attributes: Record<string, string>) =>
  [
    attributes.class,
    attributes.id,
    attributes.alt,
    attributes.title,
    attributes.itemprop,
    attributes['aria-label'],
    attributes['data-name'],
    attributes['data-image'],
  ]
    .filter(Boolean)
    .join(' ');

const scoreHints = (value: string) => {
  const lowered = value.toLowerCase();
  let score = 0;
  POSITIVE_HINTS.forEach((hint) => {
    if (lowered.includes(hint)) score += 6;
  });
  NEGATIVE_HINTS.forEach((hint) => {
    if (lowered.includes(hint)) score -= 10;
  });
  if (lowered.endsWith('.svg')) score -= 6;
  return score;
};

const addCandidate = (
  map: Map<string, number>,
  candidate: string,
  baseScore: number,
  baseUrl: string,
  hints?: string,
) => {
  const normalized = normalizeImageCandidate(candidate, baseUrl);
  if (!normalized) return;
  const hintScore = scoreHints(`${normalized} ${hints ?? ''}`);
  const score = baseScore + hintScore;
  const existing = map.get(normalized);
  if (existing === undefined || score > existing) {
    map.set(normalized, score);
  }
};

const parseSrcsetCandidates = (srcset: string) => {
  return srcset
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [url, descriptor] = part.split(/\s+/);
      let width = 0;
      let density = 0;
      if (descriptor?.endsWith('w')) {
        width = Number.parseInt(descriptor.replace('w', ''), 10) || 0;
      } else if (descriptor?.endsWith('x')) {
        density = Number.parseFloat(descriptor.replace('x', '')) || 0;
      }
      return { url, width, density };
    });
};

const pickBestFromSrcset = (srcset: string) => {
  const candidates = parseSrcsetCandidates(srcset);
  let best: { url: string; score: number } | null = null;
  for (const candidate of candidates) {
    const score = candidate.width || (candidate.density ? Math.round(candidate.density * 1000) : 0);
    if (!best || score > best.score) {
      best = { url: candidate.url, score };
    }
  }
  return best;
};

const collectImageTagCandidates = (html: string, baseUrl: string, map: Map<string, number>) => {
  const imgRegex = /<img\s+[^>]*>/gi;
  for (const match of html.matchAll(imgRegex)) {
    const attributes = parseTagAttributes(match[0]);
    const hints = buildHintText(attributes);
    if (attributes.src) addCandidate(map, attributes.src, 60, baseUrl, hints);

    const lazyKeys = [
      'data-src',
      'data-lazy-src',
      'data-original',
      'data-image',
      'data-zoom-image',
      'data-large-image',
      'data-hires',
      'data-full-url',
      'data-pin-media',
    ];
    lazyKeys.forEach((key) => {
      const value = attributes[key];
      if (value) addCandidate(map, value, 68, baseUrl, hints);
    });

    const srcsetValue =
      attributes.srcset ||
      attributes['data-srcset'] ||
      attributes['data-lazy-srcset'];
    if (srcsetValue) {
      const best = pickBestFromSrcset(srcsetValue);
      if (best?.url) {
        addCandidate(map, best.url, 72 + Math.min(best.score / 200, 10), baseUrl, hints);
      }
    }
  }

  const sourceRegex = /<source\s+[^>]*>/gi;
  for (const match of html.matchAll(sourceRegex)) {
    const attributes = parseTagAttributes(match[0]);
    const hints = buildHintText(attributes);
    const srcsetValue =
      attributes.srcset ||
      attributes['data-srcset'] ||
      attributes['data-lazy-srcset'];
    if (srcsetValue) {
      const best = pickBestFromSrcset(srcsetValue);
      if (best?.url) {
        addCandidate(map, best.url, 55 + Math.min(best.score / 200, 8), baseUrl, hints);
      }
    }
  }
};

const extractMetaImageUrls = (html: string, baseUrl: string) => {
  const urls: string[] = [];
  const metaRegex = /<meta\s+[^>]*>/gi;
  for (const match of html.matchAll(metaRegex)) {
    const attributes = parseTagAttributes(match[0]);
    const key = (attributes.property || attributes.name || attributes.itemprop || '').toLowerCase();
    if (!key || !attributes.content) continue;
    if (!IMAGE_META_KEYS.has(key)) continue;
    const normalized = normalizeImageCandidate(attributes.content, baseUrl);
    if (normalized) urls.push(normalized);
  }

  const linkRegex = /<link\s+[^>]*>/gi;
  for (const match of html.matchAll(linkRegex)) {
    const attributes = parseTagAttributes(match[0]);
    const rel = (attributes.rel || '').toLowerCase();
    if (!attributes.href) continue;
    if (!rel.includes('image_src')) continue;
    const normalized = normalizeImageCandidate(attributes.href, baseUrl);
    if (normalized) urls.push(normalized);
  }

  return urls;
};

const collectJsonLdImages = (value: unknown, baseUrl: string, urls: string[]) => {
  if (!value) return;
  if (typeof value === 'string') {
    const normalized = normalizeImageCandidate(value, baseUrl);
    if (normalized) urls.push(normalized);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => collectJsonLdImages(entry, baseUrl, urls));
    return;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (record.image) collectJsonLdImages(record.image, baseUrl, urls);
    if (record.thumbnailUrl) collectJsonLdImages(record.thumbnailUrl, baseUrl, urls);
    if (record['@graph']) collectJsonLdImages(record['@graph'], baseUrl, urls);
    if (record.mainEntity) collectJsonLdImages(record.mainEntity, baseUrl, urls);

    const typeValue = record['@type'];
    const isImageObject =
      typeof typeValue === 'string' && typeValue.toLowerCase().includes('image');
    if (isImageObject && record.url) {
      collectJsonLdImages(record.url, baseUrl, urls);
    }
  }
};

const extractJsonLdImageUrls = (html: string, baseUrl: string) => {
  const urls: string[] = [];
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(scriptRegex)) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      const json = JSON.parse(raw);
      collectJsonLdImages(json, baseUrl, urls);
    } catch {
      continue;
    }
  }
  return urls;
};

const fetchWithTimeout = async (url: string, options: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const looksLikeImageUrl = (url: string) =>
  /\.(avif|webp|jpe?g|png|gif|svg|bmp|tiff|ico)(\?.*)?$/i.test(url);

const isImageContentType = (contentType: string | null) =>
  contentType?.toLowerCase().startsWith('image/');

const isReachableImageUrl = async (url: string, referer?: string) => {
  if (url.startsWith('data:')) return true;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; RecipePalBot/1.0)',
    Accept: 'image/*,*/*;q=0.8',
    ...(referer ? { Referer: referer } : {}),
  };

  try {
    const head = await fetchWithTimeout(url, {
      method: 'HEAD',
      redirect: 'follow',
      cache: 'no-store',
      headers,
    });
    const contentType = head.headers.get('content-type');
    if (head.ok && (isImageContentType(contentType) || looksLikeImageUrl(url))) {
      return true;
    }
  } catch {
    // Ignore and fall back to GET
  }

  try {
    const get = await fetchWithTimeout(url, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      headers: { ...headers, Range: 'bytes=0-0' },
    });
    const contentType = get.headers.get('content-type');
    return get.ok && (isImageContentType(contentType) || looksLikeImageUrl(url));
  } catch {
    return false;
  }
};

const fetchHtml = async (url: string) => {
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipePalBot/1.0)',
        Accept: 'text/html,*/*',
        'Accept-Language': 'en-US,en;q=0.8',
      },
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('text/html')) return null;
    return await response.text();
  } catch {
    return null;
  }
};

const resolveRecipeImageUrl = async (pageUrl: string, candidateUrl?: string) => {
  const normalizedCandidate = candidateUrl
    ? normalizeImageCandidate(candidateUrl, pageUrl)
    : null;

  if (
    normalizedCandidate &&
    (normalizedCandidate.startsWith('data:') || await isReachableImageUrl(normalizedCandidate, pageUrl))
  ) {
    return normalizedCandidate;
  }

  const html = await fetchHtml(pageUrl);
  if (!html) return normalizedCandidate || undefined;

  const candidates = new Map<string, number>();
  extractMetaImageUrls(html, pageUrl).forEach((url) => addCandidate(candidates, url, 90, pageUrl));
  extractJsonLdImageUrls(html, pageUrl).forEach((url) => addCandidate(candidates, url, 85, pageUrl));
  collectImageTagCandidates(html, pageUrl, candidates);

  const rankedCandidates = [...candidates.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([url]) => url);

  let tried = 0;
  for (const url of rankedCandidates) {
    if (tried >= MAX_IMAGE_CANDIDATES) break;
    if (await isReachableImageUrl(url, pageUrl)) return url;
    tried += 1;
  }

  return normalizedCandidate || undefined;
};

// The main function that triggers the import recipe flow.
export async function importRecipe(input: ImportRecipeInput): Promise<ImportRecipeOutput> {
  return importRecipeFlow(input);
}

const importRecipePrompt = ai.definePrompt({
  name: 'importRecipePrompt',
  input: { schema: ImportRecipeInputSchema },
  output: { schema: ImportRecipeOutputSchema },
  prompt: `You are an expert recipe data extractor. Analyze the content of the provided URL and extract the recipe details.

Please extract the following information:
- Recipe Name
- Ingredients (as a list of strings)
- Instructions (as a single block of text)
- Servings (if available)
- Prep Time in minutes (if available)
- Cook Time in minutes (if available)

URL: {{{url}}}

Extract the recipe information and provide it in the specified JSON format. If a piece of information is not available, omit it.`,
});

const importRecipeFlow = ai.defineFlow(
  {
    name: 'importRecipeFlow',
    inputSchema: ImportRecipeInputSchema,
    outputSchema: ImportRecipeOutputSchema,
  },
  async (input) => {
    const { output } = await importRecipePrompt(input);
    if (!output) {
      throw new Error('Failed to extract recipe from URL.');
    }

    if (!output.name) {
      throw new Error('Failed to extract recipe name from URL.');
    }

    // Always generate an AI image for imported recipes and ignore source URLs.
    output.imageUrl = undefined;
    const imageResult = await generateRecipeImage({
      name: output.name,
      ingredients: output.ingredients,
    });
    if (!imageResult.imageUrl) {
      throw new Error('AI image generation did not return an image.');
    }
    output.imageUrl = imageResult.imageUrl;

    return output;
  }
);
