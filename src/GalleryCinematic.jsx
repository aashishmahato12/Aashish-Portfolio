import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './gallery-cinematic.css';

gsap.registerPlugin(ScrollTrigger);

export default function GalleryCinematic({ items }) {
  const rootRef = useRef(null);
  const frames = [items[0], items[5], items[11], items[16], items[21], items[25]].filter(Boolean);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const root = rootRef.current;
        const isPhone = window.matchMedia('(max-width: 700px)').matches;
        const cards = gsap.utils.toArray('.cinematic-card', root);
        const words = gsap.utils.toArray('.cinematic-line', root);
        const progress = root.querySelector('.cinematic-progress-fill');
        const world = root.querySelector('.cinematic-world');
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: () => `+=${window.innerHeight * (isPhone ? 3.6 : 3.2)}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.set(cards.slice(1), { autoAlpha: 0 });
        gsap.set(words.slice(1), { autoAlpha: 0, y: 35 });
        timeline.to(progress, { scaleX: 1, duration: 6, ease: 'none' }, 0)
          .fromTo(world, { z: isPhone ? -60 : -120, rotateY: -7 }, { z: isPhone ? 45 : 90, rotateY: 7, duration: 6, ease: 'none' }, 0);

        cards.forEach((card, index) => {
          const at = index;
          timeline.fromTo(card, { z: isPhone ? -160 : -220, xPercent: index % 2 ? 14 : -14, rotateY: index % 2 ? -16 : 16, scale: .82 }, {
            z: isPhone ? 70 : 100, xPercent: 0, rotateY: 0, scale: 1, duration: 1.05, ease: 'power2.out',
          }, at);
          if (index) timeline.to(card, { autoAlpha: 1, duration: .3 }, at - .16);
          if (index < cards.length - 1) timeline.to(card, { z: isPhone ? 220 : 400, scale: 1.18, autoAlpha: 0, duration: .7, ease: 'power2.in' }, at + .88);
          if (index < words.length - 1) {
            timeline.to(words[index], { autoAlpha: 0, y: -32, duration: .25 }, at + .7);
            timeline.to(words[index + 1], { autoAlpha: 1, y: 0, duration: .35 }, at + .9);
          }
        });
      }, rootRef);
      return () => context.revert();
    });
    return () => media.revert();
  }, [items]);

  if (!frames.length) return null;

  return <section className="gallery-cinematic" ref={rootRef} aria-labelledby="cinematic-title">
    <div className="cinematic-top"><span>THE FINAL CUT / 04</span><span>AASHISH MAHATO · VISUAL ARCHIVE</span></div>
    <div className="cinematic-scene" aria-hidden="true"><div className="cinematic-world">
      {frames.map((item, index) => <div className="cinematic-card" key={`${item.src}-${index}`}>
        <img src={item.type === 'video' ? item.poster : item.src} alt="" loading="lazy" />
        <span>{String(index + 1).padStart(2, '0')} / {item.category || item.type}</span>
      </div>)}
    </div></div>
    <div className="cinematic-copy"><span className="cinematic-kicker">A JOURNEY THROUGH THE WORK</span>
      <h2 id="cinematic-title">{frames.map((item, index) => <span className="cinematic-line" key={`${item.src}-title`}>{index === 0 ? 'EVERY FRAME' : index === frames.length - 1 ? 'MORE TO COME.' : item.title.toUpperCase()}</span>)}</h2>
      <p>Film. Image. Design. A different perspective with every scroll.</p>
    </div>
    <div className="cinematic-bottom"><span>SCROLL TO EXPLORE ↓</span><div className="cinematic-progress"><i className="cinematic-progress-fill" /></div><span>{String(frames.length).padStart(2, '0')} SELECTED FRAMES</span></div>
  </section>;
}
