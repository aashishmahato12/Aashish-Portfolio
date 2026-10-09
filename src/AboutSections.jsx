import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CreativeTV from './CreativeTV.jsx';
import HandwrittenText from './HandwrittenText.jsx';
import FloppyLibrary from './FloppyLibrary.jsx';
import { MapPin, GraduationCap, Monitor, Clapperboard, Camera, Sparkles, PenTool, Palette, PanelsTopLeft, Code2, ArrowUpRight } from 'lucide-react';
import { collaborators, featuredProjects, galleryMedia } from './portfolio-data.js';
import { officialProfiles } from './seo-data.js';
import './about-sections.css';

gsap.registerPlugin(ScrollTrigger);
const disciplines = [
  { name: 'Film', description: 'Travel films from Mustang and Manang.', href: '/work/film/', image: featuredProjects[0].cover, video: featuredProjects[0].media[0].src, caption: 'Mustang / Travel film' },
  { name: 'Photography', description: 'Portrait, street, nature, and landscape photography.', href: '/work/photography/', image: galleryMedia.find(item => item.id === 'street-portrait').src, caption: 'Street portrait / Photography' },
  { name: 'Motion', description: 'Animated product videos and motion graphics.', href: '/work/motion/', image: featuredProjects[2].cover, video: featuredProjects[2].media[0].src, caption: 'Product Motion / Digital licence' },
  { name: 'Branding', description: 'Brand identities, business cards, and booklets.', href: '/work/branding/', image: featuredProjects[3].cover, caption: 'CIC Nepal / Brand presentation' },
  { name: 'Graphic design', description: 'Campaign graphics and social media posters.', href: '/work/graphic/', image: featuredProjects[5].cover, caption: 'Cosmic Group / Campaign graphics' },
  { name: 'Digital', description: 'Website and mobile interface designs.', href: '/work/digital/', image: featuredProjects[4].cover, caption: 'Decora / Digital presentation' },
  { name: 'Web', description: 'Website designs and web development.', href: '/work/web/', image: '/media/branding/macbook-mockup-3.webp', caption: 'CIC Nepal / Website mockup' },
];
const stillWork = featuredProjects.flatMap(project => project.media).filter(media => media.type === 'photo');
disciplines.forEach(discipline => {
  if (discipline.video) return;
  const category = { Photography: 'Photography', Branding: 'Branding', 'Graphic design': 'Graphic Design', Digital: 'Digital', Web: 'Digital' }[discipline.name];
  const media = discipline.name === 'Photography' ? galleryMedia : stillWork;
  const slides = media.filter(item => item.type === 'photo' && item.category === category);
  discipline.slides = [...slides.filter(item => item.src === discipline.image), ...slides.filter(item => item.src !== discipline.image)];
});

function useMotion(ref) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const cleanup = [];
      const context = gsap.context(() => {
        const cover = ref.current.querySelector('.about-cover-portrait');
        if (cover) {
          gsap.set(cover, { scale: 1.1, opacity: .55, transformOrigin: 'center 42%' });
          const revealCover = () => gsap.to(cover, {
            scale: 1, opacity: 1, duration: 1.65, ease: 'power2.out',
            clearProps: 'transform,opacity,transformOrigin',
          });
          if (cover.complete) revealCover();
          else {
            const onLoad = () => context.add(revealCover);
            cover.addEventListener('load', onLoad, { once: true });
            cleanup.push(() => cover.removeEventListener('load', onLoad));
          }
        }
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
  const [firstNameWritten, setFirstNameWritten] = useState(false);
  const finishFirstName = useCallback(() => setFirstNameWritten(true), []);
  useMotion(ref);
  return <div className="kinetic-about" ref={ref}>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mr+Dafoe&display=swap" />
    <section className="kinetic-hero kinetic-hero--portrait" aria-labelledby="kinetic-title">
      <img className="about-cover-portrait" src="/media/photos/about-backlight-white.png" alt="Backlit portrait of Aashish Mahato looking over his shoulder" width="1456" height="1080" fetchPriority="high" />
      <div className="about-cover-top"><span>ABOUT ME</span><span>KATHMANDU, NEPAL</span></div>
      <div className="about-cover-name">
        <div className="about-cover-handwriting" aria-hidden="true"><HandwrittenText>Creative</HandwrittenText></div>
        <h1 className="kinetic-title" id="kinetic-title" aria-label="Aashish Mahato"><span className="kinetic-full-name" aria-hidden="true">{['AASHISH', 'MAHATO'].map((name, index) => <HandwrittenText className="kinetic-name-word" key={name} speed={3.6} delay={index ? .05 : .3} play={index === 0 || firstNameWritten} onComplete={index === 0 ? finishFirstName : undefined}>{name}</HandwrittenText>)}</span></h1>
        <div className="about-cover-footer"><p>Film. Photography. Design. Code.</p><a href="#kinetic-intro">MEET ME <span>↓</span></a></div>
      </div>
    </section>
    <section className="kinetic-intro" id="kinetic-intro" aria-labelledby="kinetic-intro-title">
      <div className="kinetic-section-label"><span>01 / ABOUT ME</span><span>BACKGROUND</span></div>
      <div className="kinetic-intro-grid">
        <h2 id="kinetic-intro-title" data-reveal>About me.</h2>
        <div className="about-person-summary" data-reveal>
          <p className="kinetic-bio">I’m Aashish Mahato. I work in filmmaking, photography, graphic design, and web development.</p>
          <div className="about-fact-chips"><span><MapPin size={16} aria-hidden="true" />Kathmandu, Nepal</span><span><GraduationCap size={16} aria-hidden="true" />Herald College Kathmandu</span></div>
        </div>
      </div>
      <div className="about-story-cards">
        <article className="about-story-card" data-reveal><div className="about-card-icon"><Monitor aria-hidden="true" /></div><span>THE START / 2020</span><h3>My first computer.</h3><p>I started using a computer in 2020 and became interested in IT, graphic design, and video editing.</p></article>
        <article className="about-story-card" data-reveal><div className="about-card-icon"><Palette aria-hidden="true" /></div><span>GRAPHIC DESIGN / SINCE 2023</span><h3>Learning graphic design.</h3><p>I started with LinkedIn banners and social media posters. At Cosmic Electrical, I gained experience in layout and graphic design.</p><a href="/work/graphic/">See my design work <ArrowUpRight size={16} aria-hidden="true" /></a></article>
        <article className="about-story-card" data-reveal><div className="about-card-icon"><GraduationCap aria-hidden="true" /></div><span>COLLEGE / 2026</span><h3>Studying at Herald.</h3><p>I joined Herald College Kathmandu in June 2026. My college projects include web applications and motion graphics.</p><a href="/work/">Explore my work <ArrowUpRight size={16} aria-hidden="true" /></a></article>
      </div>
      <div className="kinetic-socials about-profile-row">{officialProfiles.map(profile => <a key={profile.url} href={profile.url} target="_blank" rel="noopener noreferrer">{profile.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</div>
      <div className="kinetic-fieldwork"><figure><div className="kinetic-fieldwork-image"><img src="/media/posters/manang.jpg" alt="Himalayan landscape from Aashish Mahato’s Manang travel film" loading="lazy" /></div><figcaption>IN THE FIELD / MANANG</figcaption></figure><figure><div className="kinetic-fieldwork-image"><img src="/media/branding/document.webp" alt="CIC Nepal brand presentation designed by Aashish Mahato" loading="lazy" /></div><figcaption>AT THE DESK / CIC NEPAL</figcaption></figure></div>
    </section>
    <section className="kinetic-manifesto" aria-labelledby="kinetic-quote-title"><div className="kinetic-manifesto-inner"><h2 id="kinetic-quote-title">{'Film, photography, design, and web development.'.split(' ').map((word, index) => <span className="kinetic-quote-word" key={index}>{word} </span>)}</h2><div><p>My portfolio includes travel films, portraits, brand identities, graphics, and websites.</p><a href="/gallery/">View my gallery <ArrowUpRight size={16} aria-hidden="true" /></a></div></div></section>
  </div>;
}

export function AboutAfterTimeline() {
  const ref = useRef(null);
  const [active, setActive] = useState(null);
  const toolkitRef = useRef(null);
  const [filmIndex, setFilmIndex] = useState(() => Math.floor(Math.random() * 2));
  const selectChannel = index => { if (index === 0) setFilmIndex(Math.floor(Math.random() * 2)); setActive(index); };
  const nextFilm = () => setFilmIndex(index => (index + 1) % 2);
  useMotion(ref);
  const selected = useMemo(() => {
    if (active === null) return null;
    if (active !== 0) return disciplines[active];
    const film = featuredProjects[filmIndex];
    return { ...disciplines[0], image: film.cover, video: film.media[0].src, caption: `${film.title} / Travel film`, rotateFilms: true };
  }, [active, filmIndex]);
  return <div className="kinetic-about" ref={ref}>
    <section className="kinetic-practice" aria-labelledby="kinetic-practice-title"><div className="kinetic-section-label"><span>03 / MY SKILLS</span><span>SELECT A SKILL</span></div><h2 id="kinetic-practice-title" data-reveal>MY <em>SKILLS.</em></h2>
      <div className="kinetic-playground"><FloppyLibrary controlRef={toolkitRef} items={disciplines} active={active} onSelect={selectChannel} /><div className="kinetic-preview"><CreativeTV item={selected} channel={active} count={disciplines.length} onChannel={selectChannel} onVideoEnd={nextFilm} onEject={origin => toolkitRef.current?.eject(origin)} /><div className="kinetic-preview-caption" aria-live="polite">{selected ? <><span>{selected.caption}</span><p>{selected.description}</p><a href={selected.href}>Explore {selected.name.toLowerCase()} <span aria-hidden="true">↗</span></a></> : <><span>CRT / WAITING FOR A DISK</span><p>Open the toolkit and choose a disk to see what I make.</p></>}</div></div></div>
    </section>
    <section className="kinetic-partners" aria-labelledby="kinetic-partner-title"><div className="kinetic-section-label"><span>04 / COLLABORATIONS</span><span>BRANDS AND TEAMS</span></div><h2 id="kinetic-partner-title" data-reveal>Clients &amp; <em>teams.</em></h2><div className="kinetic-logos">{collaborators.map(company => <div key={company.name}><img src={company.logo} alt={company.name} loading="lazy" /></div>)}</div></section>
    <section className="about-conversation" aria-labelledby="about-conversation-title"><span>CONTACT ME</span><h2 id="about-conversation-title" data-reveal>Have a project in mind?</h2><div className="about-conversation-copy"><p>Tell me what you want to make, who it’s for, and when you need it.</p><a href="/contact/">Contact me <ArrowUpRight size={16} aria-hidden="true" /></a></div></section>
  </div>;
}
