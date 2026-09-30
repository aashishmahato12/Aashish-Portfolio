import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { featuredProjects, galleryMedia } from './portfolio-data.js';
import './gallery-letter-title.css';

const letterImages = [
  galleryMedia.find((item) => item.id === 'prayer-flags').src,
  featuredProjects[0].cover,
  galleryMedia.find((item) => item.id === 'street-portrait').src,
  featuredProjects[3].cover,
  galleryMedia.find((item) => item.id === 'evening-sky').src,
  featuredProjects[5].cover,
  galleryMedia.find((item) => item.id === 'boudhanath').src,
];

export default function GalleryLetterTitle() {
  const ref = useRef(null);

  useEffect(() => () => {
    if (ref.current) gsap.killTweensOf(ref.current.querySelectorAll('.gallery-hover-letter, .gallery-hover-glyph, .gallery-hover-image'));
  }, []);

  const show = (event) => {
    const letter = event.currentTarget;
    const glyph = letter.querySelector('.gallery-hover-glyph');
    const image = letter.querySelector('.gallery-hover-image');
    const originalWidth = glyph.getBoundingClientRect().width;
    const imageWidth = Math.max(originalWidth * 1.45, Math.min(window.innerWidth * .14, 190));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.killTweensOf([letter, glyph, image]);
    gsap.set(letter, { width: originalWidth });
    gsap.to(letter, { width: imageWidth, duration: reduced ? 0 : .55, ease: 'power3.out' });
    gsap.to(glyph, { autoAlpha: 0, scale: .7, duration: reduced ? 0 : .24, ease: 'power2.in' });
    gsap.fromTo(image, { autoAlpha: 0, scale: .72, rotation: -7 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: reduced ? 0 : .52, ease: 'back.out(1.6)' });
  };

  const move = (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const letter = event.currentTarget;
    const bounds = letter.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    gsap.to(letter.querySelector('.gallery-hover-image img'), { x: x * 16, y: y * 12, rotation: x * 5, duration: .35, ease: 'power2.out', overwrite: 'auto' });
  };

  const hide = (event) => {
    const letter = event.currentTarget;
    const glyph = letter.querySelector('.gallery-hover-glyph');
    const image = letter.querySelector('.gallery-hover-image');
    const originalWidth = glyph.getBoundingClientRect().width;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.killTweensOf([letter, glyph, image]);
    gsap.to(letter, { width: originalWidth, duration: reduced ? 0 : .75, ease: 'elastic.out(1,.55)', onComplete: () => gsap.set(letter, { clearProps: 'width' }) });
    gsap.to(glyph, { autoAlpha: 1, scale: 1, duration: reduced ? 0 : .35, delay: reduced ? 0 : .1, ease: 'power2.out' });
    gsap.to(image, { autoAlpha: 0, scale: .8, rotation: 6, duration: reduced ? 0 : .25, ease: 'power2.in' });
    gsap.to(image.querySelector('img'), { x: 0, y: 0, rotation: 0, duration: reduced ? 0 : .3, overwrite: 'auto' });
  };

  return <h1 className="gallery-intro-title" aria-label="The Gallery." ref={ref}>
    <span className="gallery-title-line" aria-hidden="true"><span>{Array.from('THE').map((character, index) => <span className="masked-title-char" key={`${character}-${index}`}>{character}</span>)}</span></span>
    <span className="gallery-title-line" aria-hidden="true"><span className="gallery-hover-word">{Array.from('GALLERY').map((character, index) => <span className="gallery-hover-letter" key={`${character}-${index}`} onPointerEnter={show} onPointerMove={move} onPointerLeave={hide}><span className="masked-title-char gallery-hover-glyph">{character}</span><span className="gallery-hover-image"><img src={letterImages[index]} alt="" loading="eager" draggable="false" /></span></span>)}<i className="masked-title-dot">.</i></span></span>
  </h1>;
}
