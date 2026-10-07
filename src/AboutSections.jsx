import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate } from 'animejs';
import { collaborators, featuredProjects, galleryMedia } from './portfolio-data.js';
import { creativeBio, officialProfiles } from './seo-data.js';
import './about-sections.css';

gsap.registerPlugin(ScrollTrigger);
const disciplines = [
  { name: 'Film', description: 'Stories with a sense of place. Travel films through Mustang and Manang.', href: '/work/film/', image: featuredProjects[0].cover, caption: 'Mustang / Travel film' },
  { name: 'Photography', description: 'People, places, and the little things that deserve a second look.', href: '/work/photography/', image: galleryMedia.find(item => item.id === 'street-portrait').src, caption: 'Street portrait / Photography' },
  { name: 'Motion', description: 'Turning a static idea into something you can feel in motion.', href: '/work/motion/', image: featuredProjects[2].cover, caption: 'Product Motion / Digital licence' },
  { name: 'Branding', description: 'A visual identity that carries an idea from the page into the world.', href: '/work/branding/', image: featuredProjects[3].cover, caption: 'CIC Nepal / Brand presentation' },
  { name: 'Graphic design', description: 'Campaigns, layouts, and graphics with a clear point of view.', href: '/work/graphic/', image: featuredProjects[5].cover, caption: 'Cosmic Group / Campaign graphics' },
  { name: 'Digital', description: 'Thoughtful interfaces that connect visual design with everyday use.', href: '/work/digital/', image: featuredProjects[4].cover, caption: 'Decora / Digital presentation' },
  { name: 'Web', description: 'Bringing the design to life in a working website.', href: '/work/web/', image: '/media/branding/macbook-mockup-3.webp', caption: 'CIC Nepal / Website mockup' },
];

function useMotion(ref) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const cleanup = [];
      const context = gsap.context(() => {
        if (ref.current.querySelector('.kinetic-title')) gsap.from('.kinetic-char', { yPercent: 115, skewY: 7, duration: 1, stagger: .045, ease: 'power4.out', delay: .4 });
        if (ref.current.querySelector('.kinetic-portrait')) gsap.from('.kinetic-portrait', { clipPath: 'inset(100% 0 0 0)', duration: 1.25, delay: .55, ease: 'power4.inOut' });
        gsap.utils.toArray('[data-reveal]', ref.current).forEach(el => gsap.from(el, { y: 45, opacity: 0, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
        gsap.utils.toArray('.kinetic-quote-word', ref.current).forEach((word, index) => gsap.fromTo(word, { opacity: .2 }, { opacity: 1, scrollTrigger: { trigger: '.kinetic-manifesto', start: `top ${75 - index * 3}%`, end: `top ${58 - index * 3}%`, scrub: true } }));
        const portrait = ref.current.querySelector('.kinetic-portrait');
        const stage = ref.current.querySelector('.kinetic-hero');
        if (portrait && matchMedia('(pointer:fine)').matches) {
          const x = gsap.quickTo(portrait, 'rotationY', { duration: .65, ease: 'power3.out' });
          const y = gsap.quickTo(portrait, 'rotationX', { duration: .65, ease: 'power3.out' });
          const move = event => { const box = stage.getBoundingClientRect(); x(((event.clientX - box.left) / box.width - .5) * 18); y(-((event.clientY - box.top) / box.height - .5) * 12); };
          const leave = () => { x(0); y(0); };
          stage.addEventListener('pointermove', move); stage.addEventListener('pointerleave', leave);
          cleanup.push(() => { stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', leave); });
        }
        if (portrait) gsap.to(portrait.querySelector('img'), { yPercent: -7, scale: 1.08, ease: 'none', scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom top', scrub: .7 } });
        const rule = ref.current.querySelector('.kinetic-drawing-line');
        if (rule) gsap.from(rule, { scaleX: 0, transformOrigin: 'left', ease: 'none', scrollTrigger: { trigger: '.kinetic-manifesto', start: 'top 85%', end: 'top 30%', scrub: .7 } });
        gsap.utils.toArray('.kinetic-fieldwork img', ref.current).forEach(image => gsap.fromTo(image, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: .7 } }));
      }, ref);
      return () => { cleanup.forEach(fn => fn()); context.revert(); };
    });
    return () => media.revert();
  }, [ref]);
}

export function AboutOpening() {
  const ref = useRef(null);
  useMotion(ref);
  return <div className="kinetic-about" ref={ref}>
    <section className="kinetic-hero" aria-labelledby="kinetic-title">
      <img className="kinetic-hero-background" src="/media/photos/about-hero-stage.jpg" alt="" width="1536" height="1024" fetchPriority="high" />
      <div className="kinetic-topline"><span>AASHISH MAHATO</span><span>KATHMANDU, NEPAL / MULTIDISCIPLINARY CREATIVE</span></div>
      <div className="kinetic-stage">
        <div className="kinetic-hero-copy">
          <span className="kinetic-hero-eyebrow">ABOUT ME / CREATIVE IN KATHMANDU</span>
          <h1 className="kinetic-title" id="kinetic-title" aria-label="Aashish Mahato">{['AASHISH', 'MAHATO.'].map(line => <span aria-hidden="true" key={line}>{Array.from(line).map((letter, index) => <span className="kinetic-char" key={index}>{letter}</span>)}</span>)}</h1>
          <div className="kinetic-hero-description"><span>FILMMAKER. PHOTOGRAPHER.<br />DESIGNER. DEVELOPER.</span><p>I turn observations into images,<br />ideas into identities,<br />and designs into experiences.</p></div>
        </div>
        <span className="kinetic-hero-index" aria-hidden="true">[ A / M ]</span>
      </div>
      <div className="kinetic-hero-bottom"><p>One person. Many creative directions.<br />Always looking for a different perspective.</p><a href="#kinetic-intro">SCROLL TO MEET ME <span>↓</span></a><span className="kinetic-live"><i /> BASED IN KATHMANDU</span></div>
    </section>
    <section className="kinetic-intro" id="kinetic-intro" aria-labelledby="kinetic-intro-title">
      <div className="kinetic-section-label"><span>01 / THE PERSON</span><span>A LITTLE CONTEXT</span></div>
      <div className="kinetic-intro-grid"><h2 id="kinetic-intro-title" data-reveal>Behind<br />the work.<br /><em>Beyond a title.</em></h2><div data-reveal><p className="kinetic-bio">{creativeBio.replace('Aashish Mahato is', 'I’m').replace('His portfolio', 'My portfolio')}</p><p>I move between mediums to make the idea feel right. From a frame in the mountains to an identity on a screen, I care about how the work feels—and how it works.</p><div className="kinetic-socials">{officialProfiles.map(profile => <a key={profile.url} href={profile.url} target="_blank" rel="noopener noreferrer">{profile.label} ↗</a>)}</div></div></div>
      <div className="kinetic-fieldwork"><figure><img src="/media/posters/manang.jpg" alt="Himalayan landscape from Aashish Mahato’s Manang travel film" loading="lazy" /><figcaption>IN THE FIELD / MANANG</figcaption></figure><div><span>MY WORK STARTS WITH LOOKING.</span><p>At people. At places.<br />At how things move.</p><a href="/gallery/">See my perspective ↗</a></div><figure><img src="/media/branding/document.webp" alt="CIC Nepal brand presentation designed by Aashish Mahato" loading="lazy" /><figcaption>AT THE DESK / CIC NEPAL</figcaption></figure></div>
    </section>
    <section className="kinetic-manifesto" aria-labelledby="kinetic-quote-title"><span>MY POINT OF VIEW</span><h2 id="kinetic-quote-title">{'The idea comes first. I find its form.'.split(' ').map((word, index) => <span className="kinetic-quote-word" key={index}>{word} </span>)}</h2><p>A film can become a photograph. A visual identity can become a digital experience. Each project gets the form it deserves.</p><span className="kinetic-drawing-line" aria-hidden="true" /></section>
  </div>;
}

export function AboutAfterTimeline() {
  const ref = useRef(null);
  const previewRef = useRef(null);
  const [active, setActive] = useState(0);
  useMotion(ref);
  useLayoutEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = animate(previewRef.current, { opacity: [0, 1], translateY: [30, 0], rotate: [-2, 0], duration: 600, ease: 'out(3)' });
    return () => animation.revert();
  }, [active]);
  const selected = disciplines[active];
  return <div className="kinetic-about" ref={ref}>
    <section className="kinetic-practice" aria-labelledby="kinetic-practice-title"><div className="kinetic-section-label"><span>03 / THE PRACTICE</span><span>CHOOSE A CREATIVE DIRECTION</span></div><h2 id="kinetic-practice-title" data-reveal>One creative.<br /><em>Multiple disciplines.</em></h2>
      <div className="kinetic-playground"><div className="kinetic-discipline-list" role="group" aria-label="Choose a discipline to preview">{disciplines.map((item, index) => <button type="button" aria-pressed={active === index} onClick={() => setActive(index)} key={item.name}><span>0{index + 1}</span><strong>{item.name}</strong><span aria-hidden="true">↗</span></button>)}</div><div className="kinetic-preview" ref={previewRef}><div className="kinetic-preview-image"><img src={selected.image} alt={selected.caption} loading="lazy" /></div><div className="kinetic-preview-caption" aria-live="polite"><span>{selected.caption}</span><p>{selected.description}</p><a href={selected.href}>Explore {selected.name.toLowerCase()} <span aria-hidden="true">↗</span></a></div></div></div>
    </section>
    <section className="kinetic-partners" aria-labelledby="kinetic-partner-title"><div className="kinetic-section-label"><span>04 / COLLABORATIONS</span><span>GOOD PEOPLE. GOOD WORK.</span></div><h2 id="kinetic-partner-title" data-reveal>Better <em>together.</em></h2><div className="kinetic-logos">{collaborators.map(company => <div key={company.name}><img src={company.logo} alt={company.name} loading="lazy" /></div>)}</div></section>
    <section className="about-conversation" aria-labelledby="about-conversation-title"><span>YOUR PROJECT. ONE ACCOUNTABLE PARTNER.</span><h2 id="about-conversation-title" data-reveal>Let’s connect the scope and build the delivery plan.</h2><p>Tell me what you want to make, who it’s for, and when you need it.</p><a href="/contact/">Start a conversation <span aria-hidden="true">↗</span></a></section>
  </div>;
}
