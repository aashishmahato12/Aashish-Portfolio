import { useEffect, useState } from 'react';

export function useNearViewport(ref) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); observer.disconnect(); }
    }, { rootMargin: '600px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return near;
}
