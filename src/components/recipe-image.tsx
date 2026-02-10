'use client';

import Image from 'next/image';
import React from 'react';
import { cn } from '@/lib/utils';

const ALLOWED_IMAGE_HOSTS = new Set([
  'placehold.co',
  'www.gordonramsay.com',
]);

const BLOCKED_IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'picsum.photos',
]);

const FALLBACK_IMAGE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f6e4cf"/>
        <stop offset="55%" stop-color="#f8efe1"/>
        <stop offset="100%" stop-color="#f1d8c2"/>
      </linearGradient>
      <linearGradient id="plate" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d86735"/>
        <stop offset="100%" stop-color="#a44a26"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#bg)"/>
    <circle cx="600" cy="380" r="170" fill="#fff8ef" opacity="0.94"/>
    <circle cx="600" cy="380" r="124" fill="url(#plate)" opacity="0.92"/>
    <path d="M548 320c0 36-26 62-26 94 0 32 23 58 70 58 51 0 82-30 82-70 0-34-23-55-54-78-16-11-25-22-25-40 0-17 9-30 9-46 0-20-12-33-31-33-17 0-27 12-27 30 0 18 11 33 11 55z" fill="#fff4ea" opacity="0.9"/>
    <text x="600" y="650" fill="#5a3a2a" font-size="56" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif">RecipePal</text>
  </svg>
`)}`;

const isLikelyLocal = (src: string) => src.startsWith('/');
const isDataLike = (src: string) => src.startsWith('data:') || src.startsWith('blob:');

const normalizeProtocolRelative = (src: string) => {
  if (src.startsWith('//')) {
    return `https:${src}`;
  }
  return src;
};

const shouldBlockSource = (src: string) => {
  if (isLikelyLocal(src) || isDataLike(src)) return false;
  const normalizedSrc = normalizeProtocolRelative(src);
  try {
    const url = new URL(normalizedSrc);
    return BLOCKED_IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

const canUseNextImage = (src: string) => {
  if (isLikelyLocal(src)) return true;
  if (isDataLike(src)) return false;
  const normalizedSrc = normalizeProtocolRelative(src);
  try {
    const url = new URL(normalizedSrc);
    return ALLOWED_IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

interface RecipeImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
}

export function RecipeImage({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  className,
  priority,
  fallbackSrc,
}: RecipeImageProps) {
  const fallback = fallbackSrc || FALLBACK_IMAGE;
  const [currentSrc, setCurrentSrc] = React.useState<string>(
    src && !shouldBlockSource(src) ? src : fallback
  );

  React.useEffect(() => {
    if (!src || shouldBlockSource(src)) {
      setCurrentSrc(fallback);
      return;
    }

    setCurrentSrc(src);
  }, [src, fallback]);

  const normalizedSrc = normalizeProtocolRelative(currentSrc || fallback);
  const useNextImage = canUseNextImage(normalizedSrc) && (fill || (!!width && !!height));

  const handleError = () => {
    if (normalizedSrc !== fallback) {
      setCurrentSrc(fallback);
    }
  };

  if (useNextImage) {
    return (
      <Image
        src={normalizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        className={className}
        priority={priority}
        onError={handleError}
      />
    );
  }

  return (
    <img
      src={normalizedSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={cn(className, fill ? 'absolute inset-0 h-full w-full' : undefined)}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={handleError}
    />
  );
}
