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

export default function GalleryLetterTitle({ text = 'GALLERY', prefix = 'THE', as: Tag = 'h1', className = '', paused = false, onCycle }) {
  const ref = useRef(null);
  const autoControllerRef = useRef(null);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const letters = Array.from(ref.current.querySelectorAll('.gallery-hover-letter'));
    let timeline;
    let delay;
    let stopped = false;

    const reset = () => letters.forEach((letter) => {
      const glyph = letter.querySelector('.gallery-hover-glyph');
      const image = letter.querySelector('.gallery-hover-image');
      gsap.set(letter, { clearProps: 'width' });
      gsap.set(glyph, { clearProps: 'opacity,visibility,scale' });
      gsap.set(image, { autoAlpha: 0, scale: 1, rotation: 0, xPercent: 0 });
    });
    const stop = () => {
      delay?.kill();
      timeline?.kill();
      gsap.killTweensOf(letters);
      reset();
    };
    const play = () => {
      if (stopped) return;
      const widths = letters.map((letter) => letter.querySelector('.gallery-hover-glyph').getBoundingClientRect().width);
      const order = gsap.utils.shuffle(letters.map((_, index) => index));
      timeline = gsap.timeline({ onComplete: () => { reset(); if (onCycle) onCycle(); else delay = gsap.delayedCall(1.05, play); } });
      order.forEach((index, position) => {
        const letter = letters[index];
        const glyph = letter.querySelector('.gallery-hover-glyph');
        const image = letter.querySelector('.gallery-hover-image');
        const width = widths[index];
        const desired = Math.max(width * 1.45, Math.min(window.innerWidth * .14, 190));
        const expanded = Math.min(desired, width + Math.max(12, (className.includes("identity-gallery-title") ? ref.current.clientWidth - 30 : window.innerWidth - 40) - widths.reduce((sum, value) => sum + value, 0)));
        const at = Math.max(0, position * gsap.utils.random(.68, .82) + gsap.utils.random(-.07, .07));
        const direction = gsap.utils.random([-1, 1]);
        const tilt = gsap.utils.random(4, 10) * direction;
        timeline.set(letter, { width }, at)
          .to(letter, { width: expanded, duration: gsap.utils.random(.48, .58), ease: 'power3.out' }, at)
          .to(glyph, { autoAlpha: 0, scale: .7, duration: .22 }, at)
          .fromTo(image, { autoAlpha: 0, scale: .7, rotation: tilt, xPercent: direction * 13 }, { autoAlpha: 1, scale: 1, rotation: 0, xPercent: 0, duration: .45, ease: 'back.out(1.6)' }, at)
          .to(image, { autoAlpha: 0, scale: .82, rotation: -tilt * .5, duration: .32, ease: 'power2.in' }, at + .57)
          .to(glyph, { autoAlpha: 1, scale: 1, duration: .32 }, at + .65)
          .to(letter, { width, duration: .48, ease: 'elastic.out(1,.6)' }, at + .65);
      });
    };
    const schedule = (seconds = 1.4) => {
      delay?.kill();
      timeline?.kill();
      delay = gsap.delayedCall(seconds, play);
    };
    autoControllerRef.current = { stop, schedule };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) schedule(2.3);
      else stop();
    }, { threshold: .1 });
    Promise.resolve(document.fonts?.ready).then(() => { if (!stopped) observer.observe(ref.current); });
    return () => {
      stopped = true;
      observer.disconnect();
      stop();
      autoControllerRef.current = null;
    };
  }, [text, paused]);

  const show = (event) => {
    autoControllerRef.current?.stop();
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
    autoControllerRef.current?.schedule(1.5);
  };

  return <Tag className={`gallery-intro-title ${className}`} aria-label={`${prefix ? prefix + " " : ""}${text}.`} ref={ref}>
    <span className="gallery-title-line" aria-hidden="true"><span>{Array.from(prefix || '').map((character, index) => <span className="masked-title-char" key={`${character}-${index}`}>{character}</span>)}</span></span>
    <span className="gallery-title-line" aria-hidden="true"><span className="gallery-hover-word">{Array.from(text).map((character, index) => character === ' ' ? <span className="gallery-hover-space" key={index}> </span> : <span className="gallery-hover-letter" key={`${character}-${index}`} onPointerEnter={show} onPointerMove={move} onPointerLeave={hide}><span className="masked-title-char gallery-hover-glyph">{character}</span><span className="gallery-hover-image"><img src={letterImages[index % letterImages.length]} alt="" loading="eager" draggable="false" /></span></span>)}<i className="masked-title-dot">.</i></span></span>
  </Tag>;
}
