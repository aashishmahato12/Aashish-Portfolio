import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { collaborators, featuredProjects, galleryMedia } from './portfolio-data.js';
import './about-sections.css';
import { creativeBio, officialProfiles } from './seo-data.js';

gsap.registerPlugin(ScrollTrigger);

const skills = [
  { number: '01', title: 'FILM', detail: 'Stories with a sense of place.', href: '/work/film/', image: featuredProjects[0].cover, size: 'wide' },
  { number: '02', title: 'PHOTOGRAPHY', detail: 'A moment, seen differently.', href: '/work/photography/', image: galleryMedia.find((item) => item.id === 'street-portrait').src, size: 'narrow' },
  { number: '03', title: 'MOTION', detail: 'Ideas brought into movement.', href: '/work/motion/', image: featuredProjects[2].cover, size: 'narrow' },
  { number: '04', title: 'BRANDING', detail: 'An identity people remember.', href: '/work/branding/', image: featuredProjects[3].cover, size: 'wide' },
  { number: '05', title: 'GRAPHIC DESIGN', detail: 'The message made visual.', href: '/work/graphic/', image: featuredProjects[5].cover, size: 'wide' },
  { number: '06', title: 'DIGITAL', detail: 'Experiences with purpose.', href: '/work/digital/', image: featuredProjects[4].cover, size: 'narrow' },
  { number: '07', title: 'WEB DEVELOPMENT', detail: 'Designed and built to work.', href: '/work/web/', image: '/media/branding/macbook-mockup-3.webp', size: 'full' },
];

function AnimatedLine({ text }) {
  return <span className="about-redesign-line" aria-hidden="true">{Array.from(text).map((letter, index) => <span className="about-redesign-letter" key={`${letter}-${index}`}>{letter === ' ' ? '\u00a0' : letter}</span>)}</span>;
}

export function AboutOpening() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const routeOverlay = document.querySelector('.experience-transition');
        const delay = routeOverlay && getComputedStyle(routeOverlay).display !== 'none' ? .55 : .15;
        gsap.timeline({ delay, defaults: { ease: 'power4.out' } })
          .from('.about-redesign-hero .about-redesign-letter', { yPercent: 115, rotateX: -25, stagger: .032, duration: .85 }, 0)
          .from('.about-redesign-hero-art', { clipPath: 'inset(100% 0 0 0)', scale: 1.12, duration: 1.15 }, .15)
          .from('.about-redesign-hero-meta > *', { autoAlpha: 0, y: 25, stagger: .1, duration: .75 }, .55)
          .from('.about-redesign-age', { autoAlpha: 0, scale: .4, rotation: -30, duration: .8, ease: 'back.out(1.8)' }, .65);
        gsap.to('.about-redesign-hero-art img', { yPercent: 13, ease: 'none', scrollTrigger: { trigger: '.about-redesign-hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.from('.about-redesign-manifesto-word', { yPercent: 110, stagger: .09, ease: 'power3.out', duration: .9, scrollTrigger: { trigger: '.about-redesign-manifesto', start: 'top 70%', once: true } });
        gsap.from('.about-redesign-manifesto-copy > *', { autoAlpha: 0, y: 38, stagger: .16, ease: 'power3.out', duration: .8, scrollTrigger: { trigger: '.about-redesign-manifesto-copy', start: 'top 85%', once: true } });
        gsap.fromTo('.about-redesign-manifesto-rule i', { scaleY: 0 }, { scaleY: 1, transformOrigin: 'top', ease: 'none', scrollTrigger: { trigger: '.about-redesign-manifesto', start: 'top 65%', end: 'bottom 40%', scrub: true } });
      }, ref);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);

  return <div className="about-redesign-opening" ref={ref}>
    <section className="about-redesign-hero" aria-labelledby="about-redesign-title">
      <div className="about-redesign-hero-backdrop" aria-hidden="true">A/M</div>
      <div className="about-redesign-hero-inner">
        <div className="about-redesign-eyebrow"><span>01 / THE PERSON BEHIND THE WORK</span><span>BASED IN NEPAL · WORKING ACROSS MEDIA</span></div>
        <h1 id="about-redesign-title" aria-label="Aashish Mahato"><AnimatedLine text="AASHISH" />{' '}<AnimatedLine text="MAHATO." /></h1>
        <div className="about-redesign-hero-art"><img src="/media/photos/tree-final-27.webp" alt="Colorful prayer flags photographed by Aashish Mahato" fetchPriority="high" /></div>
        <div className="about-redesign-age" aria-label="20 years old"><strong>20</strong><span>YEARS YOUNG<br />ALWAYS MAKING</span></div>
        <div className="about-redesign-hero-meta"><p>FILM. IMAGE. DESIGN. CODE.</p><p>I move between mediums to make the idea feel right.</p><a href="#about-redesign-manifesto">GET TO KNOW ME <span aria-hidden="true">↓</span></a></div>
      </div>
    </section>
    <section className="about-redesign-manifesto" id="about-redesign-manifesto" aria-labelledby="about-manifesto-title">
      <div className="about-redesign-manifesto-top"><span>WHY WORK WITH ME</span><span>ONE MIND. MANY WAYS TO MAKE.</span></div>
      <div className="about-redesign-manifesto-grid"><div className="about-redesign-manifesto-rule" aria-hidden="true"><i /></div><div><h2 id="about-manifesto-title"><span><span className="about-redesign-manifesto-word">THE IDEA</span></span><span><span className="about-redesign-manifesto-word">COMES FIRST.</span></span><span><em className="about-redesign-manifesto-word">I FIND ITS FORM.</em></span></h2><div className="about-redesign-manifesto-copy"><p>{creativeBio}</p><p>A film can become a photograph. A visual identity can become a digital experience. I work across all of them, so each project gets the form it deserves.</p><p>I keep refining the details until the result meets the client's expectations and my own.</p><p className="official-profile-links" aria-label="Aashish Mahato’s official profiles">{officialProfiles.map((profile) => <a href={profile.url} key={profile.url} target="_blank" rel="noopener noreferrer">{profile.label} ↗</a>)}</p><span>CURIOUS BY NATURE / COMMITTED TO THE FINISH</span></div></div></div>
    </section>
  </div>;
}

export function AboutAfterTimeline() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const root = ref.current;
        gsap.utils.toArray('.about-redesign-skill', root).forEach((card, index) => {
          gsap.from(card, { y: 100, rotate: index % 2 ? 3 : -3, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 92%', once: true } });
          gsap.to(card.querySelector('img'), { yPercent: 12, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
        gsap.from('.about-redesign-count strong', { textContent: 0, duration: 1.5, snap: { textContent: 1 }, ease: 'power2.out', scrollTrigger: { trigger: '.about-redesign-collaborations', start: 'top 70%', once: true } });
        gsap.utils.toArray('.about-redesign-logo-track', root).forEach((track, index) => {
          gsap.fromTo(track, { xPercent: index ? -50 : 0 }, { xPercent: index ? 0 : -50, ease: 'none', duration: index ? 42 : 48, repeat: -1 });
        });
      }, ref);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);

  const logoRows = [collaborators.slice(0, 6), collaborators.slice(6)];
  return <div className="about-redesign-after" ref={ref}>
    <section className="about-redesign-skills" aria-labelledby="about-skills-title"><div className="about-redesign-section-head"><span>03 / THE PRACTICE</span><span>SEVEN WAYS IN</span></div><div className="about-redesign-skills-heading"><h2 id="about-skills-title">I MAKE<br /><em>THINGS MOVE.</em></h2><p>Every skill opens into real work. Pick a direction and explore.</p></div><div className="about-redesign-skill-grid">{skills.map((skill) => <a className={`about-redesign-skill about-redesign-skill-${skill.size}`} href={skill.href} key={skill.number}><img src={skill.image} alt="" loading="lazy" /><span className="about-redesign-skill-shade" /><span className="about-redesign-skill-top">{skill.number} / 07 <span>EXPLORE ↗</span></span><span className="about-redesign-skill-bottom"><strong>{skill.title}</strong><small>{skill.detail}</small></span></a>)}</div></section>
    <section className="about-redesign-collaborations" aria-labelledby="about-collaborations-title"><div className="about-redesign-section-head"><span>04 / IN GOOD COMPANY</span><span>COLLABORATIONS</span></div><div className="about-redesign-collab-heading"><div className="about-redesign-count"><strong>{collaborators.length}</strong><span>BRANDS & TEAMS<br />WORKED WITH</span></div><h2 id="about-collaborations-title">MADE<br /><em>TOGETHER.</em></h2></div><p>Different people, different ambitions, one shared goal: make something worth seeing.</p><div className="about-redesign-logo-rows" aria-label="Companies and brands Aashish has worked with">{logoRows.map((row, index) => <div className="about-redesign-logo-viewport" key={index}><div className="about-redesign-logo-track">{[...row, ...row].map((company, itemIndex) => <div className="about-redesign-logo" key={`${company.name}-${itemIndex}`} aria-hidden={itemIndex >= row.length}><img src={company.logo} alt={itemIndex >= row.length ? '' : company.name} loading="lazy" /></div>)}</div></div>)}</div></section>
  </div>;
}
