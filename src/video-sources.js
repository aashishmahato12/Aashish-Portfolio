// Keep the original dimensions, frame rate, duration, and quality setting.
// Original MP4 URLs remain canonical and are always available as fallbacks.
export function webmVideoSource(src) {
  if (!src?.startsWith('https://res.cloudinary.com/ghmgpvvn/video/upload/v') || !src.endsWith('.mp4')) return null;
  // Only prefer derivatives verified to be smaller and fully processed/cached.
  // Quality-100 travel-film derivatives exceed 100 MB, so keep their originals.
  if (!['v1791543451/hero.mp4', 'v1791546163/Savari_Promo_Video.mp4'].some(path => src.endsWith('/' + path))) return null;
  return src.replace('/video/upload/', '/video/upload/f_webm,vc_vp9,q_100/').replace(/\.mp4$/, '.webm');
}

export function loadVideoSource(video, originalSrc) {
  const webm = webmVideoSource(originalSrc);
  const useWebm = webm && video.canPlayType('video/webm; codecs="vp9"');
  if (useWebm) {
    video.addEventListener('error', () => {
      const resume = !video.paused || video.autoplay || video.muted;
      video.src = originalSrc;
      video.load();
      if (resume) video.play().catch(() => {});
    }, { once: true });
  }
  video.src = useWebm ? webm : originalSrc;
}
