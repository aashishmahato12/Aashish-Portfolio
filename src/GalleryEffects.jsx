import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './gallery-effects.css';

gsap.registerPlugin(ScrollTrigger);

function GalleryZoomScene({ photos, sceneIndex, sceneCount }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const root = ref.current;
        const layers = gsap.utils.toArray('.gallery-zoom-layer', root);
        const nonCenter = layers.filter((_, index) => index !== 4);
        gsap.timeline({ scrollTrigger: { trigger: root, start: 'top top', end: '+=185%', scrub: true, pin: true, anticipatePin: 1 } })
          .set(nonCenter, { autoAlpha: 0 })
          .to(nonCenter, { autoAlpha: 1, duration: .08 }, .02)
          .from(layers, { scale: 3.333, ease: 'none', duration: 1 }, 0);
      }, ref);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  const headingId = `gallery-zoom-heading-${sceneIndex}`;
  return <section className="gallery-zoom" ref={ref} aria-labelledby={headingId}>
    <div className="gallery-zoom-heading"><span>THE ARCHIVE / {String(sceneIndex + 1).padStart(2, '0')} OF {String(sceneCount).padStart(2, '0')}</span><h2 id={headingId}>A WORLD<br /><em>OF FRAMES.</em></h2><p>SCROLL TO REVEAL ↓</p></div>
    <div className="gallery-zoom-stage">{photos.map((item, index) => <div className={`gallery-zoom-layer ${index === 4 ? 'is-center' : ''}`} key={`${item.src}-${index}`}><div className="gallery-zoom-block"><img src={item.src} alt={item.title} loading={sceneIndex === 0 && index === 4 ? 'eager' : 'lazy'} /></div></div>)}</div>
  </section>;
}

export function GalleryZoomGrid({ photos }) {
  const scenes = [];
  for (let index = 0; index < photos.length; index += 9) scenes.push(photos.slice(index, index + 9));
  return <>{scenes.map((scene, index) => <GalleryZoomScene key={scene[0].src} photos={scene} sceneIndex={index} sceneCount={scenes.length} />)}</>;
}

export function GalleryPhotoFlow({ photos }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray('.gallery-flow-image', ref.current).forEach((frame) => {
          gsap.fromTo(frame.querySelector('img'), { yPercent: -14 }, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
        });
      }, ref);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  return <section className="gallery-photo-flow" ref={ref} aria-labelledby="gallery-flow-heading">
    <div className="experience-shell gallery-photo-flow-heading"><span>THE ARCHIVE / 02</span><h2 id="gallery-flow-heading">THE LONGER LOOK.</h2><p>Photography and design from the complete visual collection.</p></div>
    <div className="gallery-photo-flow-grid">{photos.map((item, index) => <figure className="gallery-flow-image" key={`${item.src}-${index}`}><img src={item.src} alt={item.title} loading="lazy" /><figcaption>{String(index + 1).padStart(2, '0')} / {item.title}</figcaption></figure>)}</div>
  </section>;
}

export function GalleryFinalGrid({ photos }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.timeline({ scrollTrigger: { trigger: ref.current.querySelector('.gallery-final-grid'), start: 'top 65%', end: 'bottom 85%', scrub: 1 } })
          .from('.gallery-final-grid-inner', { scale: 2.25, ease: 'power1.inOut' }, 0)
          .from('.gallery-final-column:first-child .gallery-final-image', { xPercent: (i) => -(i + 1) * 65, yPercent: (i) => (i + 1) * 45, ease: 'power1.inOut' }, 0)
          .from('.gallery-final-column:last-child .gallery-final-image', { xPercent: (i) => (i + 1) * 65, yPercent: (i) => (i + 1) * 45, ease: 'power1.inOut' }, 0);
        const feature = ref.current.querySelector('.gallery-final-feature');
        gsap.from(feature, { scale: 1 / 3, transformOrigin: 'center top', ease: 'none', scrollTrigger: { trigger: feature, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true } });
        gsap.fromTo(feature.querySelector('img'), { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: feature, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
        const pin = ref.current.querySelector('.gallery-final-pin');
        const first = pin.querySelector('.gallery-final-lane:first-child');
        const second = pin.querySelector('.gallery-final-lane:last-child');
        gsap.timeline({ scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${Math.max(window.innerWidth, first.scrollWidth - window.innerWidth)}`, pin: true, scrub: true, invalidateOnRefresh: true } })
          .fromTo(first, { x: () => window.innerWidth * .55 }, { x: () => -(first.scrollWidth - window.innerWidth * .7), ease: 'none' }, 0)
          .fromTo(second, { x: () => -(second.scrollWidth - window.innerWidth * .65) }, { x: () => window.innerWidth * .1, ease: 'none' }, 0);
      }, ref);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  return <section className="gallery-final" ref={ref} aria-labelledby="gallery-final-title">
    <div className="experience-shell gallery-final-heading"><span>THE ARCHIVE / 03</span><h2 id="gallery-final-title">MORE TO SEE.</h2><p>Keep moving through the work.</p></div>
    <div className="gallery-final-grid"><div className="gallery-final-grid-inner">{[0, 1, 2].map((column) => <div className="gallery-final-column" key={column}>{photos.slice(column * 3, column * 3 + 3).map((item) => <div className="gallery-final-image" key={item.src}><img src={item.src} alt={item.title} loading="lazy" /></div>)}</div>)}</div></div>
    <div className="gallery-final-feature"><img src={photos[9 % photos.length].src} alt={photos[9 % photos.length].title} loading="lazy" /></div>
    <div className="gallery-final-pin">{[0, 1].map((row) => <div className="gallery-final-lane" key={row}>{photos.slice(10 + row * 3, 13 + row * 3).map((item) => <div className="gallery-final-lane-item" key={item.src}><img src={item.src} alt={item.title} loading="lazy" /></div>)}</div>)}</div>
  </section>;
}
