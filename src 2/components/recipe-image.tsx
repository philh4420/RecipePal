'use client';

import Image from 'next/image';
import React from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const ALLOWED_IMAGE_HOSTS = new Set([
  'placehold.co',
  'images.unsplash.com',
  'picsum.photos',
  'www.gordonramsay.com',
]);

const FALLBACK_IMAGE = PlaceHolderImages[0].imageUrl;

const isLikelyLocal = (src: string) => src.startsWith('/');
const isDataLike = (src: string) => src.startsWith('data:') || src.startsWith('blob:');

const normalizeProtocolRelative = (src: string) => {
  if (src.startsWith('//')) {
    return `https:${src}`;
  }
  return src;
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
  const [currentSrc, setCurrentSrc] = React.useState<string>(src || fallback);

  React.useEffect(() => {
    setCurrentSrc(src || fallback);
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
