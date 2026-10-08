import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  { name: 'Film', description: 'Stories with a sense of place. Travel films through Mustang and Manang.', href: '/work/film/', image: featuredProjects[0].cover, video: '/media/videos/mustang.mp4', caption: 'Mustang / Travel film' },
  { name: 'Photography', description: 'People, places, and the little things that deserve a second look.', href: '/work/photography/', image: galleryMedia.find(item => item.id === 'street-portrait').src, caption: 'Street portrait / Photography' },
  { name: 'Motion', description: 'Turning a static idea into something you can feel in motion.', href: '/work/motion/', image: featuredProjects[2].cover, video: '/media/videos/product-motion.mp4', caption: 'Product Motion / Digital licence' },
  { name: 'Branding', description: 'A visual identity that carries an idea from the page into the world.', href: '/work/branding/', image: featuredProjects[3].cover, caption: 'CIC Nepal / Brand presentation' },
  { name: 'Graphic design', description: 'Campaigns, layouts, and graphics with a clear point of view.', href: '/work/graphic/', image: featuredProjects[5].cover, caption: 'Cosmic Group / Campaign graphics' },
  { name: 'Digital', description: 'Thoughtful interfaces that connect visual design with everyday use.', href: '/work/digital/', image: featuredProjects[4].cover, caption: 'Decora / Digital presentation' },
  { name: 'Web', description: 'Bringing the design to life in a working website.', href: '/work/web/', image: '/media/branding/macbook-mockup-3.webp', caption: 'CIC Nepal / Website mockup' },
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
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mr+Dafoe&display=swap" />
    <section className="kinetic-hero kinetic-hero--portrait" aria-labelledby="kinetic-title">
      <img className="about-cover-portrait" src="/media/photos/about-backlight-white.png" alt="Backlit portrait of Aashish Mahato looking over his shoulder" width="1456" height="1080" fetchPriority="high" />
      <div className="about-cover-top"><span>THE PERSON BEHIND THE WORK</span><span>KATHMANDU, NEPAL</span></div>
      <div className="about-cover-name">
        <div className="about-cover-handwriting" aria-hidden="true"><HandwrittenText>Creative</HandwrittenText></div>
        <h1 className="kinetic-title" id="kinetic-title" aria-label="Aashish Mahato"><span className="kinetic-full-name" aria-hidden="true">{['AASHISH', 'MAHATO'].map(name => <span className="kinetic-name-word" key={name}>{Array.from(name).map((letter, index) => <span className="kinetic-char" key={index}>{letter}</span>)}</span>)}</span></h1>
        <div className="about-cover-footer"><p>Film. Photography. Design. Code.</p><a href="#kinetic-intro">MEET ME <span>↓</span></a></div>
      </div>
    </section>
    <section className="kinetic-intro" id="kinetic-intro" aria-labelledby="kinetic-intro-title">
      <div className="kinetic-section-label"><span>01 / THE PERSON</span><span>A LITTLE CONTEXT</span></div>
      <div className="kinetic-intro-grid">
        <h2 id="kinetic-intro-title" data-reveal>Behind the work.<br /><em>A little about me.</em></h2>
        <div className="about-person-summary" data-reveal>
          <p className="kinetic-bio">I’m Aashish Mahato. I bring ideas to life through film, photography, design, and code.</p>
          <div className="about-fact-chips"><span><MapPin size={16} aria-hidden="true" />Kathmandu, Nepal</span><span><GraduationCap size={16} aria-hidden="true" />Herald College Kathmandu</span></div>
        </div>
      </div>
      <div className="about-story-cards">
        <article className="about-story-card" data-reveal><div className="about-card-icon"><Monitor aria-hidden="true" /></div><span>THE START / 2020</span><h3>Curiosity came first.</h3><p>Getting hands-on with a computer sparked my interest in IT, graphic design, and video editing. I started exploring, experimenting, and learning by making.</p></article>
        <article className="about-story-card" data-reveal><div className="about-card-icon"><Palette aria-hidden="true" /></div><span>THE PRACTICE / SINCE 2023</span><h3>From small to meaningful.</h3><p>LinkedIn banners grew into social media posters and real design briefs. My time with Cosmic Electrical sharpened my eye for layout and visual communication.</p><a href="/work/graphic/">See my design work <ArrowUpRight size={16} aria-hidden="true" /></a></article>
        <article className="about-story-card" data-reveal><div className="about-card-icon"><GraduationCap aria-hidden="true" /></div><span>THE NEXT CHAPTER / 2026</span><h3>Still learning. Still making.</h3><p>Travel brought me into filmmaking and photography. At Herald College Kathmandu, I’m building web applications and exploring motion graphics through college projects.</p><a href="/work/">Explore my work <ArrowUpRight size={16} aria-hidden="true" /></a></article>
      </div>
      <div className="kinetic-socials about-profile-row">{officialProfiles.map(profile => <a key={profile.url} href={profile.url} target="_blank" rel="noopener noreferrer">{profile.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</div>
      <div className="kinetic-fieldwork"><figure><div className="kinetic-fieldwork-image"><img src="/media/posters/manang.jpg" alt="Himalayan landscape from Aashish Mahato’s Manang travel film" loading="lazy" /></div><figcaption>IN THE FIELD / MANANG</figcaption></figure><figure><div className="kinetic-fieldwork-image"><img src="/media/branding/document.webp" alt="CIC Nepal brand presentation designed by Aashish Mahato" loading="lazy" /></div><figcaption>AT THE DESK / CIC NEPAL</figcaption></figure></div>
    </section>
    <section className="kinetic-manifesto" aria-labelledby="kinetic-quote-title"><div className="kinetic-manifesto-inner"><h2 id="kinetic-quote-title">{'The idea comes first. I find its form.'.split(' ').map((word, index) => <span className="kinetic-quote-word" key={index}>{word} </span>)}</h2><div><p>A film can become a photograph. A visual identity can become a digital experience. Each project gets the form it deserves.</p><a href="/gallery/">See my perspective <ArrowUpRight size={16} aria-hidden="true" /></a></div></div></section>
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
    <section className="kinetic-practice" aria-labelledby="kinetic-practice-title"><div className="kinetic-section-label"><span>03 / THE PRACTICE</span><span>CHOOSE A CREATIVE DIRECTION</span></div><h2 id="kinetic-practice-title" data-reveal>One creative.<br /><em>Multiple disciplines.</em></h2>
      <div className="kinetic-playground"><FloppyLibrary controlRef={toolkitRef} items={disciplines} active={active} onSelect={selectChannel} /><div className="kinetic-preview"><CreativeTV item={selected} channel={active} count={disciplines.length} onChannel={selectChannel} onVideoEnd={nextFilm} onEject={origin => toolkitRef.current?.eject(origin)} /><div className="kinetic-preview-caption" aria-live="polite">{selected ? <><span>{selected.caption}</span><p>{selected.description}</p><a href={selected.href}>Explore {selected.name.toLowerCase()} <span aria-hidden="true">↗</span></a></> : <><span>CRT / WAITING FOR A DISK</span><p>Open the toolkit and choose a disk to see what I make.</p></>}</div></div></div>
    </section>
    <section className="kinetic-partners" aria-labelledby="kinetic-partner-title"><div className="kinetic-section-label"><span>04 / COLLABORATIONS</span><span>GOOD PEOPLE. GOOD WORK.</span></div><h2 id="kinetic-partner-title" data-reveal>Better <em>together.</em></h2><div className="kinetic-logos">{collaborators.map(company => <div key={company.name}><img src={company.logo} alt={company.name} loading="lazy" /></div>)}</div></section>
    <section className="about-conversation" aria-labelledby="about-conversation-title"><span>YOUR PROJECT. ONE ACCOUNTABLE PARTNER.</span><h2 id="about-conversation-title" data-reveal>Let’s connect the scope and build the delivery plan.</h2><div className="about-conversation-copy"><p>Tell me what you want to make, who it’s for, and when you need it.</p><a href="/contact/">Start a conversation <ArrowUpRight size={16} aria-hidden="true" /></a></div></section>
  </div>;
}
