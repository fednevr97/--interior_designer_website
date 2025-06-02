// src/app/shared/components/MemoizedImage/MemoizedImage.tsx
'use client'

import React from 'react';
import Image, { ImageProps } from 'next/image';

interface MemoizedImageProps extends Omit<ImageProps, 'ref'> {
  ref?: React.Ref<HTMLImageElement>;
}

const MemoizedImage = React.memo(({
  src,
  alt,
  width,
  height,
  style,
  className,
  loading = 'lazy',
  quality = 75,
  fill,
  sizes,
  onDoubleClick,
  ref,
  ...props
}: MemoizedImageProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={style}
      className={className}
      loading={loading}
      quality={quality}
      fill={fill}
      sizes={sizes}
      onDoubleClick={onDoubleClick}
      ref={ref}
      {...props}
    />
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для оптимизации ререндеров
  return (
    prevProps.src === nextProps.src &&
    prevProps.style === nextProps.style &&
    prevProps.className === nextProps.className &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.fill === nextProps.fill
  );
});

MemoizedImage.displayName = 'MemoizedImage';

export default MemoizedImage;