import React, { forwardRef } from 'react';
import { webmVideoSource } from './video-sources.js';

// Native source selection skips WebM on unsupported browsers and tries the
// original MP4 if loading or decoding the WebM source fails.
const Video = forwardRef(function Video({ src, children, ...props }, ref) {
  const webm = webmVideoSource(src);
  return <video key={src} ref={ref} {...props}>
    {webm && <source src={webm} type={'video/webm; codecs="vp9"'} />}
    {src && <source src={src} type={src.endsWith('.mp4') ? 'video/mp4' : undefined} />}
    {children}
  </video>;
});

export default Video;
