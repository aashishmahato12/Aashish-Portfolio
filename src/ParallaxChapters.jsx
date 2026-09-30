import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { galleryMedia, featuredProjects } from './portfolio-data.js';
import './parallax-chapters.css';

gsap.registerPlugin(ScrollTrigger);
const chapters = [
  { title: 'PLACES.', line: 'Stories found along the way.', image: featuredProjects[0].cover },
  { title: 'PEOPLE.', line: 'The moments worth keeping.', image: galleryMedia.find((item) => item.id === 'street-portrait').src },
  { title: 'POSSIBILITIES.', line: 'Every idea asks for its own form.', image: featuredProjects[3].cover },
];

export default function ParallaxChapters() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray('.parallax-chapter', ref.current).forEach((section) => {
          const image = section.querySelector('.parallax-chapter-image');
          const ratio = () => window.innerHeight / (window.innerHeight + section.offsetHeight);
          gsap.fromTo(image,
            { y: () => -window.innerHeight * ratio() * .45 },
            { y: () => window.innerHeight * (1 - ratio()) * .45,
              ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
          gsap.from(section.querySelectorAll('.parallax-chapter-content > *'), { autoAlpha: 0, y: 45, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 72%', once: true } });
        });
      }, ref);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  return <div className="parallax-chapters" ref={ref}>{chapters.map((chapter, index) => <section className="parallax-chapter" key={chapter.title} aria-label={chapter.title}>
    <div className="parallax-chapter-image" style={{ backgroundImage: `url(${chapter.image})` }} />
    <div className="parallax-chapter-shade" />
    <div className="parallax-chapter-content"><span>{String(index + 1).padStart(2, '0')} / CREATIVE PERSPECTIVES</span><h2>{chapter.title}</h2><p>{chapter.line}</p></div>
  </section>)}</div>;
}
