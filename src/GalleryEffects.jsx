import { mediaAlt } from './media-text.js';
import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './gallery-effects.css';

gsap.registerPlugin(ScrollTrigger);

export function GalleryZoomGrid({ items }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const root = ref.current;
        const stage = root.querySelector('.gallery-zoom-stage');
        const otherTiles = gsap.utils.toArray('.gallery-zoom-tile:not(.is-center)', root);
        const caption = root.querySelector('.gallery-zoom-caption');
        gsap.set(otherTiles, { autoAlpha: 0 });
        gsap.set(caption, { autoAlpha: 0, y: 30 });
        gsap.timeline({ scrollTrigger: { trigger: root, start: 'top top', end: '+=220%', scrub: true, pin: true, anticipatePin: 1, invalidateOnRefresh: true } })
          .fromTo(stage, { scale: 4.3 }, { scale: 1, ease: 'none', duration: 1 }, 0)
          .to(otherTiles, { autoAlpha: 1, duration: .2, stagger: { amount: .2, from: 'center' } }, .24)
          .to(caption, { autoAlpha: 1, y: 0, duration: .2 }, .72);
      }, ref);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  return <section className="gallery-zoom" ref={ref} aria-label="Scroll to reveal the complete visual library">
    <div className="gallery-zoom-stage">{items.map((item, index) => <a className={`gallery-zoom-tile ${index === 0 ? 'is-center' : ''}`} href={`#gallery-item-${item.id}`} key={item.id}><img src={item.type === 'video' ? item.poster : item.src} alt={mediaAlt(item)} loading={index === 0 ? 'eager' : 'lazy'} /><span>{item.type === 'video' ? '▶ FILM' : item.category || 'IMAGE'}</span></a>)}</div>
    <div className="gallery-zoom-caption"><span>THE COMPLETE VISUAL ARCHIVE / {String(items.length).padStart(2, '0')} PIECES</span><strong>ONE WORLD.<br /><em>MANY FRAMES.</em></strong><span>SCROLL FOR MORE ↓</span></div>
  </section>;
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
    <div className="experience-shell gallery-photo-flow-heading"><span>GALLERY / 02</span><h2 id="gallery-flow-heading">PHOTOGRAPHY & DESIGN.</h2><p>Photography and design from the complete visual collection.</p></div>
    <div className="gallery-photo-flow-grid">{photos.map((item, index) => <figure className="gallery-flow-image" key={`${item.src}-${index}`}><img src={item.src} alt={mediaAlt(item)} loading="lazy" /><figcaption>{String(index + 1).padStart(2, '0')} / {item.title}</figcaption></figure>)}</div>
  </section>;
}

export function GalleryFinalGrid({ photos }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const grid = ref.current.querySelector('.gallery-final-grid');
        const openingPhoto = grid.querySelector('.gallery-final-column:nth-child(2) .gallery-final-image');
        const openingScale = () => Math.max(2.25, grid.clientWidth * .9 / openingPhoto.clientWidth, grid.clientHeight / openingPhoto.clientHeight);
        gsap.timeline({ scrollTrigger: { trigger: grid, start: 'top 65%', end: 'top 10%', scrub: 1, invalidateOnRefresh: true } })
          .fromTo('.gallery-final-grid-inner', { scale: openingScale }, { scale: 1, ease: 'power1.inOut' }, 0)
          .fromTo('.gallery-final-column:first-child .gallery-final-image', { xPercent: (i) => -(i + 1) * 65, yPercent: (i) => (i + 1) * 45 }, { xPercent: 0, yPercent: 0, ease: 'power1.inOut' }, 0)
          .fromTo('.gallery-final-column:last-child .gallery-final-image', { xPercent: (i) => (i + 1) * 65, yPercent: (i) => (i + 1) * 45 }, { xPercent: 0, yPercent: 0, ease: 'power1.inOut' }, 0);
      }, ref);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  return <section className="gallery-final" ref={ref} aria-labelledby="gallery-final-title">
    <div className="experience-shell gallery-final-heading"><span>GALLERY / 03</span><h2 id="gallery-final-title">MORE PROJECTS.</h2><p>More photographs and design projects.</p></div>
    <div className="gallery-final-grid"><div className="gallery-final-grid-inner">{[0, 1, 2].map((column) => <div className="gallery-final-column" key={column}>{photos.slice(column * 3, column * 3 + 3).map((item) => <div className="gallery-final-image" key={item.src}><img src={item.src} alt={mediaAlt(item)} loading="lazy" /></div>)}</div>)}</div></div>
  </section>;
}
