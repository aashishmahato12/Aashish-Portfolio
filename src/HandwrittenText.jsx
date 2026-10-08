import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './handwritten-text.css';

gsap.registerPlugin(ScrollTrigger);

// Reveal the intact word so the script keeps its kerning and connected letters.
export default function HandwrittenText({ children, className = '' }) {
  const ref = useRef(null);
  const text = String(children);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      let disposed = false;
      const ink = ref.current.querySelector('.handwritten-ink');
      const context = gsap.context(() => {
        gsap.set(ink, { clipPath: 'inset(-45% 100% -45% -20%)' });
      }, ref);
      document.fonts.ready.then(() => {
        if (disposed) return;
        context.add(() => {
          const width = ink.getBoundingClientRect().width;
          const node = ink.firstChild;
          const range = document.createRange();
          const timeline = gsap.timeline({
            scrollTrigger: { trigger: ref.current, start: 'top 92%', once: true },
            delay: .25,
          });
          for (let index = 0; index < text.length; index++) {
            range.setStart(node, 0);
            range.setEnd(node, index + 1);
            const progress = Math.min(1, range.getBoundingClientRect().width / width);
            const right = index === text.length - 1 ? -20 : (1 - progress) * 100;
            timeline.to(ink, {
              clipPath: `inset(-45% ${right}% -45% -20%)`,
              duration: index === 0 ? .32 : .14 + (index % 3) * .045,
              ease: 'power1.inOut',
            }, index === 0 ? 0 : '>-0.025');
          }
          range.detach();
        });
      });
      return () => { disposed = true; context.revert(); };
    });
    return () => media.revert();
  }, [text]);
  return <span className={className} ref={ref} aria-hidden="true"><span className="handwritten-ink">{text}</span></span>;
}
