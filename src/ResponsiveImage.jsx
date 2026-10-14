import React from 'react';
import variants from './responsive-images.json';

export default function ResponsiveImage({ src, sizes, width, ...props }) {
  const variant = variants[src];
  return <img {...props} width={width} src={src} srcSet={variant?.srcSet} sizes={variant ? sizes || (width && width < 400 ? `${width}px` : '100vw') : undefined} />;
}
