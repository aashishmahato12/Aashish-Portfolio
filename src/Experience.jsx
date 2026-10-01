import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, stagger } from 'animejs';
import App from './App.jsx';
import HomePanels from './HomePanels.jsx';
import ParallaxChapters from './ParallaxChapters.jsx';
import AboutTimeline from './AboutTimeline.jsx';
import { AboutOpening, AboutAfterTimeline } from './AboutSections.jsx';
import { GalleryFinalGrid } from './GalleryEffects.jsx';
import GalleryLetterTitle from './GalleryLetterTitle.jsx';
import GalleryIsometricWave from './GalleryIsometricWave.jsx';
import GalleryCinematic from './GalleryCinematic.jsx';
import { Cursor, CursorFollow, CursorProvider } from './components/animate-ui/components/animate/cursor.jsx';
import { PreviewLinkCard, PreviewLinkCardContent, PreviewLinkCardImage, PreviewLinkCardPortal, PreviewLinkCardTrigger } from './components/animate-ui/primitives/radix/preview-link-card.jsx';
import { collaborators, featuredProjects, galleryMedia, heroReel, webProjects } from './portfolio-data.js';

gsap.registerPlugin(ScrollTrigger);

const routeFor = (path) => {
  const skill = path.match(/^\/work\/(film|photography|motion|branding|graphic|digital|web)\/?$/);
  if (skill) return `skill-${skill[1]}`;
  return path.startsWith('/gallery') ? 'gallery' : path.startsWith('/about') ? 'about' : 'home';
};
const searchMeta = {
  home: ['Aashish Mahato — Film, Photography & Design', 'Explore the films, photography, motion graphics, branding, graphic design, and websites of Aashish Mahato, a multidisciplinary creative based in Nepal.', '/'],
  about: ['About Aashish Mahato | Film, Design & Code', 'Meet Aashish Mahato, a Nepal-based creative working across film, photography, design, motion, and web development.', '/about/'],
  gallery: ['Gallery | Films, Photography & Design by Aashish Mahato', 'Browse Aashish Mahato’s visual archive of films, photography, branding, and graphic design projects.', '/gallery/'],
  'skill-film': ['Film Projects | Aashish Mahato', 'Watch selected films and visual storytelling projects by filmmaker Aashish Mahato.', '/work/film/'],
  'skill-photography': ['Photography Portfolio | Aashish Mahato', 'Explore portraits, places, and moments captured by photographer Aashish Mahato.', '/work/photography/'],
  'skill-motion': ['Motion Graphics | Aashish Mahato', 'See motion graphics, animated visuals, and moving-image projects by Aashish Mahato.', '/work/motion/'],
  'skill-branding': ['Branding Projects | Aashish Mahato', 'Explore logo, identity, and branding projects created by Aashish Mahato.', '/work/branding/'],
  'skill-graphic': ['Graphic Design Projects | Aashish Mahato', 'See graphic design projects, campaign artwork, and visual communication by Aashish Mahato.', '/work/graphic/'],
  'skill-digital': ['Digital Projects | Aashish Mahato', 'Explore digital product and interface design projects by Aashish Mahato.', '/work/digital/'],
  'skill-web': ['Web Development Projects | Aashish Mahato', 'Explore websites and web development projects built by Aashish Mahato.', '/work/web/'],
};
const searchImages = {
  home: '/videos/hero-poster.jpg',
  about: '/media/photos/tree-final-27.webp',
  gallery: '/media/photos/tree-final-27.webp',
  'skill-film': '/media/posters/mustang.jpg',
  'skill-photography': '/media/photos/tree-final-27.webp',
  'skill-motion': '/media/posters/product-motion.jpg',
  'skill-branding': '/media/branding/document.webp',
  'skill-graphic': '/media/design/162.webp',
  'skill-digital': '/media/branding/mockup5.webp',
  'skill-web': '/media/logos/cosmic-electrical.webp',
};

function updateSearchMeta(route) {
  const [title, description, path] = searchMeta[route];
  const url = `https://aashish-mahato.com.np${path}`;
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', `https://aashish-mahato.com.np${searchImages[route]}`);
}

function usePageMotion(dependency) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray('[data-reveal]').forEach((element) => {
          gsap.from(element, { y: 38, autoAlpha: 0, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
        });
      });
      return () => context.revert();
    });
    return () => media.revert();
  }, [dependency]);
}

function ReelVideo({ item = heroReel, controls = false, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (controls) return undefined;
    const video = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: .2 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [controls]);
  return <video ref={ref} className={className} src={item.src} poster={item.poster} muted={!controls} loop={!controls} controls={controls} playsInline preload="metadata" aria-label={item.title || 'Portfolio video'} />;
}

function SiteNav({ current }) {
  return <header className="inner-nav"><a className="inner-logo" href="/" aria-label="Aashish Mahato home">A/M<span>®</span></a><nav aria-label="Main navigation"><a href="/#my-work" aria-current={current === 'work' ? 'page' : undefined}>My Work</a><a href="/gallery/" aria-current={current === 'gallery' ? 'page' : undefined}>Gallery</a><a href="/about/" aria-current={current === 'about' ? 'page' : undefined}>About</a></nav><a className="inner-home" href="/">BACK HOME ↗</a></header>;
}

function SectionTop({ number, label, aside }) {
  return <div className="experience-section-top"><span>{number} / {label}</span><span>{aside}</span></div>;
}

function HeroCharacters({ text }) {
  return Array.from(text).map((character, index) => <span className="masked-title-char" key={`${character}-${index}`}>{character}</span>);
}

function MaskedHeroTitle({ text, id }) {
  const words = text.split(' ');
  return <h1 id={id} aria-label={`${text}.`}>{words.map((word, index) => <React.Fragment key={`${word}-${index}`}>{index > 0 && ' '}<span className="masked-title-mask" aria-hidden="true"><span className="masked-title-word"><HeroCharacters text={word} />{index === words.length - 1 && <i className="masked-title-dot">.</i>}</span></span></React.Fragment>)}</h1>;
}

function SiteFooter() {
  return <footer className="experience-footer"><a href="/" className="footer-logo">A/M<span>®</span></a><p>IMAGE · MOTION · DESIGN · CODE</p><a href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer">GITHUB ↗</a><span>© 2026 AASHISH MAHATO</span></footer>;
}

function CollaboratorMark({ company }) {
  return <div className="collaborator-mark" style={{ '--brand-color': company.color, '--brand-ink': company.ink || '#fff' }}><img src={company.logo} alt={`${company.name} logo`} loading="lazy" /><CursorProvider><Cursor className="collaborator-cursor" /><CursorFollow className="collaborator-cursor-label" side="bottom" sideOffset={12} align="start" alignOffset={8}>{company.name}</CursorFollow></CursorProvider></div>;
}

function CollaborationShowcase() {
  const rootRef = useRef(null);
  const loops = useRef([]);
  const [paused, setPaused] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      loops.current = Array.from(root.querySelectorAll('.brand-ribbon-track')).map((track, index) =>
        gsap.fromTo(track, { xPercent: index ? -50 : 0 }, {
          xPercent: index ? 0 : -50, duration: 48 + index * 6,
          repeat: -1, ease: 'none', paused: true,
        })
      );
      const sync = () => loops.current.forEach((loop) => {
        loop.paused(document.hidden || root.dataset.paused === 'true');
      });
      const mutation = new MutationObserver(sync);
      mutation.observe(root, { attributes: true, attributeFilter: ['data-paused'] });
      document.addEventListener('visibilitychange', sync);
      sync();
      return () => {
        mutation.disconnect();
        document.removeEventListener('visibilitychange', sync);
        loops.current.forEach((loop) => loop.revert()); loops.current = [];
      };
    });
    return () => media.revert();
  }, []);

  const rows = [collaborators.slice(0, 6), collaborators.slice(6)];
  return <div className="brand-ribbons" ref={rootRef} data-paused={paused} aria-label="Company collaborations">
    <div className="brand-ribbons-bar"><button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? 'RESUME MOTION ↗' : 'PAUSE MOTION Ⅱ'}</button></div>
    <div className="brand-ribbons-stage">{rows.map((row, rowIndex) => <div className="brand-ribbon" key={rowIndex}>
      <div className="brand-ribbon-track">{[0, 1].map((copy) => <div className="brand-ribbon-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
        {row.map((company) => <div className="brand-ribbon-item" key={company.name}><CollaboratorMark company={company} /></div>)}
      </div>)}</div>
    </div>)}</div>
  </div>;
}

function HomeCollaborators() {
  const sectionRef = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      let countAnimation;
      let titleAnimation;
      const context = gsap.context(() => {
        gsap.from('.brand-ribbons-stage', { autoAlpha: 0, y: 40, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.brand-ribbons-stage', start: 'top 88%', once: true } });
        ScrollTrigger.create({ trigger: sectionRef.current, start: 'top 78%', once: true, onEnter: () => {
          const counter = { value: 0 };
          const number = sectionRef.current.querySelector('.collaborator-showcase-count-number');
          countAnimation = animate(counter, { value: collaborators.length, duration: 1500, ease: 'out(4)', onUpdate: () => { number.textContent = String(Math.round(counter.value)).padStart(2, '0'); } });
          titleAnimation = animate(sectionRef.current.querySelectorAll('.collaborator-showcase-title span'), { opacity: [0, 1], translateY: [55, 0], delay: stagger(130), duration: 900, ease: 'out(4)' });
        } });
      }, sectionRef);
      return () => { countAnimation?.revert(); titleAnimation?.revert(); context.revert(); };
    });
    return () => media.revert();
  }, []);
  return <section className="home-collaborators" ref={sectionRef} aria-labelledby="home-collaborators-title"><div className="experience-shell"><SectionTop number="04" label="COLLABORATIONS" aside="THE NAMES BEHIND THE WORK" /><div className="collaborator-showcase-heading"><div className="collaborator-showcase-count"><strong className="collaborator-showcase-count-number">{String(collaborators.length).padStart(2, '0')}</strong><span>BRANDS<br />AND TEAMS</span></div><div className="collaborator-showcase-title" id="home-collaborators-title"><span>GOOD COMPANY.</span><span>BETTER WORK.</span><p>Real collaborations across film, design, and digital.</p></div></div><CollaborationShowcase /><div className="collaborator-showcase-foot"><span>THE LIST KEEPS MOVING ↗</span><span>{String(collaborators.length).padStart(2, '0')} SELECTED COLLABORATIONS</span></div></div></section>;
}

function HomeProof() {
  const sectionRef = useRef(null);
  const mosaic = [galleryMedia[1], featuredProjects[3], galleryMedia[3], featuredProjects[0], galleryMedia[7], featuredProjects[5], featuredProjects[1], galleryMedia[5], featuredProjects[4], galleryMedia[8], featuredProjects[2], galleryMedia[9]];
  const projects = [featuredProjects[3], featuredProjects[4], featuredProjects[5]];
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = gsap.context(() => {
      gsap.from('.home-proof-tile', { autoAlpha: 0, y: 28, scale: .92, duration: .65, stagger: .055, ease: 'power3.out', scrollTrigger: { trigger: '.home-proof-mosaic', start: 'top 85%', once: true } });
    }, sectionRef);
    return () => context.revert();
  }, []);
  return <section className="home-proof" ref={sectionRef} aria-labelledby="home-proof-title"><div className="home-proof-inner"><div className="home-proof-mosaic" aria-hidden="true">{mosaic.map((item, index) => <div className="home-proof-tile" key={`${item.id}-${index}`}><img src={item.cover || item.src} alt="" loading="lazy" /></div>)}</div><div className="home-proof-title" data-reveal><span>THE PEOPLE AND THE PROJECTS</span><h2 id="home-proof-title">MADE WITH TEAMS.<br /><em>BUILT WITH INTENT.</em></h2><p>A few of the collaborations behind the images, identities, and experiences.</p></div><div className="home-proof-cards">{projects.map((project, index) => { const company = collaborators.find((item) => item.name === project.company); return <a className="home-proof-card" href={projectHref(project)} key={project.id} data-reveal><div className="home-proof-card-head"><span className="home-proof-card-logo">{company && <img src={company.logo} alt="" loading="lazy" />}</span><div><strong>{project.company}</strong><small>{project.category}</small></div><span aria-hidden="true">↗</span></div><span className="home-proof-card-index">{String(index + 1).padStart(2, '0')} / CLIENT NOTE PLACEHOLDER</span><h3>{project.title}</h3><p>Client feedback for this collaboration can be added here later.</p></a>; })}</div></div></section>;
}

function Home({ lenisRef }) {
  usePageMotion('home');
  return <><App /><main>
    <HomePanels lenisRef={lenisRef} />
    <ParallaxChapters />

    <section className="home-about" aria-labelledby="home-about-title"><div className="experience-shell"><SectionTop number="02" label="THE PERSON" aside="A FEW WORDS BEFORE THE WORK" /><div className="home-about-grid"><div data-reveal><span className="experience-eyebrow">WHO I AM / WHY ME</span><h2 id="home-about-title">ONE IDEA.<br /><em>MANY WAYS</em><br />TO MAKE IT.</h2></div><div className="home-about-copy" data-reveal><span className="about-age">20 <small>YEARS OLD</small></span><p>I'm Aashish Mahato. I work across film, photography, design, and web development. I follow an idea into the format that gives it the most life.</p><p>I keep refining a project until it meets the client's expectations and my own standards.</p><a className="experience-text-link" href="/about/">MORE ABOUT ME <span>↗</span></a></div></div></div></section>

    <HomeSkills />
    <HomeCollaborators />
    <HomeProof />
    <SiteFooter />
  </main></>;
}

const photographyProjects = galleryMedia.filter((item) => item.category === 'Photography').map((item) => ({ id: item.id, title: item.title, category: 'Photography', cover: item.src, media: [item] }));
const workSkills = [
  { id: 'film', name: 'FILM', line: 'Scenes, stories, and places in motion.', cover: featuredProjects[0].cover, preview: featuredProjects[1].cover, capabilities: ['Videography', 'Editing', 'Visual storytelling'], projects: [{ id: 'showreel', title: 'Current showreel', category: 'Film', description: 'A moving overview of my visual work.', cover: heroReel.poster, media: [heroReel] }, ...featuredProjects.filter((project) => project.category === 'Travel Film')] },
  { id: 'photography', name: 'PHOTOGRAPHY', line: 'Still images that hold a moment.', cover: photographyProjects[0].cover, preview: photographyProjects[1].cover, slides: photographyProjects.slice(0, 5).map((project) => project.cover), capabilities: ['Composition', 'Portraits', 'Landscape'], projects: photographyProjects },
  { id: 'motion', name: 'MOTION GRAPHICS', line: 'Design and ideas brought into movement.', cover: featuredProjects[2].cover, preview: featuredProjects[2].cover, capabilities: ['Animation', 'Motion design', 'Editing'], projects: featuredProjects.filter((project) => project.category === 'Motion Graphics') },
  { id: 'branding', name: 'BRANDING', line: 'Visual systems built for a name and an idea.', cover: featuredProjects[3].cover, preview: featuredProjects[4].cover, slides: [featuredProjects[3].cover, featuredProjects[4].cover, featuredProjects[3].media[1].src], capabilities: ['Visual identity', 'Art direction', 'Brand mockups'], projects: featuredProjects.filter((project) => project.category === 'Brand & Digital') },
  { id: 'graphic', name: 'GRAPHIC DESIGN', line: 'Clear visual communication across formats.', cover: featuredProjects[5].cover, preview: featuredProjects[5].media[1].src, slides: featuredProjects[5].media.slice(0, 5).map((item) => item.src), capabilities: ['Campaign graphics', 'Social design', 'Layout'], projects: featuredProjects.filter((project) => project.category === 'Graphic Design') },
  { id: 'digital', name: 'DIGITAL', line: 'Interfaces and digital concepts shaped with design.', cover: featuredProjects[3].media.find((item) => item.category === 'Digital').src, preview: featuredProjects[4].media.find((item) => item.category === 'Digital').src, slides: [...featuredProjects[3].media, ...featuredProjects[4].media].filter((item) => item.category === 'Digital').map((item) => item.src), capabilities: ['Web design', 'UI concepts', 'Frontend'], projects: featuredProjects.filter((project) => project.category === 'Brand & Digital') },
  { id: 'web', name: 'WEB DEVELOPMENT', line: 'Sites and tools made to work in the real world.', cover: webProjects[0].mark, preview: webProjects[0].mark, capabilities: ['Responsive websites', 'React interfaces', 'Web tools'], projects: webProjects },
];
const projectHref = (project) => `/work/${workSkills.find((skill) => skill.projects.some((item) => item.id === project.id))?.id || 'film'}/#${project.id}`;

function WorkProjectCard({ project, index, skillId }) {
  const video = project.media?.find((item) => item.type === 'video');
  const photos = project.media?.filter((item) => item.type === 'photo' && (skillId === 'digital' ? item.category === 'Digital' : skillId === 'branding' ? item.category === 'Branding' : true)) || [];
  const cover = photos[0]?.src || project.cover;
  const extraPhotos = photos.filter((item) => item.src !== cover);
  return <article className={`work-project-card ${['branding', 'graphic', 'digital'].includes(skillId) ? 'work-project-card--design' : ''} ${skillId === 'web' ? 'work-project-card--web' : ''}`} id={project.id} data-reveal>
    <div className="work-project-visual">{skillId === 'web' ? <div className={`web-project-art web-project-art--${project.theme}`}><div className="web-project-browser"><span /><span /><span /><small>{new URL(project.liveUrl).hostname}</small></div><div className="web-project-art-content">{project.mark && <img src={project.mark} alt="" loading="lazy" />}<span>{project.category}</span><strong>{project.title}</strong><i>↗</i></div></div> : video ? <ReelVideo item={video} controls /> : <img src={cover} alt={project.title} loading="lazy" />}</div>
    <div className="work-project-info"><span>{String(index + 1).padStart(2, '0')} / {project.category}</span><h3>{project.title}</h3><p>{project.description || project.category}</p></div>
    {skillId === 'web' && <div className="web-project-links"><a href={project.liveUrl} target="_blank" rel="noopener noreferrer">VISIT {project.title.toUpperCase()} ↗</a>{project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">{project.title.toUpperCase()} SOURCE CODE ↗</a>}</div>}
    {extraPhotos.length > 0 && <div className="work-project-extras">{extraPhotos.map((item) => <figure key={item.src}><img src={item.src} alt={item.title} loading="lazy" /><figcaption>{item.title}</figcaption></figure>)}</div>}
  </article>;
}

function WorkSkillCard({ skill, index }) {
  const href = `/work/${skill.id}/`;
  return <PreviewLinkCard href={href} src={skill.preview} width={320} height={200} followCursor="x" openDelay={120} closeDelay={80}>
    <PreviewLinkCardTrigger asChild><a className="work-skill-card" href={href}><span className="work-skill-card-media"><img src={skill.cover} alt="" loading="lazy" /></span><span className="work-skill-card-meta"><span>{String(index + 1).padStart(2, '0')} / {String(skill.projects.length).padStart(2, '0')} WORKS</span><span aria-hidden="true">↗</span></span><strong>{skill.name}</strong><span className="work-skill-card-line">{skill.line}</span></a></PreviewLinkCardTrigger>
    <PreviewLinkCardPortal><PreviewLinkCardContent side="top" sideOffset={16} className="work-skill-preview"><PreviewLinkCardImage alt={`${skill.name} work preview`} /><span className="work-skill-preview-info"><strong>{skill.name}</strong><span>EXPLORE {String(skill.projects.length).padStart(2, '0')} WORKS ↗</span></span></PreviewLinkCardContent></PreviewLinkCardPortal>
  </PreviewLinkCard>;
}

function HomeSkills() {
  const sectionRef = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const cards = gsap.utils.toArray('.work-skill-card');
        gsap.from(cards, {
          autoAlpha: 0, y: 72, rotateX: 8, transformOrigin: '50% 100%',
          duration: .9, stagger: .09, ease: 'power3.out',
          scrollTrigger: { trigger: '.work-skills-list', start: 'top 86%', once: true },
        });
      }, sectionRef);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  return <section className="home-skills" id="my-work" ref={sectionRef} aria-labelledby="home-skills-title"><div className="experience-shell"><SectionTop number="03" label="MY WORK" aside="CHOOSE A DISCIPLINE" /><div className="work-skills-heading" data-reveal><h2 id="home-skills-title">WHAT I<br /><em>MAKE.</em></h2><p>Film, image, design, and code. Choose a skill to see the projects behind it.</p></div><div className="work-skills-list">{workSkills.map((skill, index) => <WorkSkillCard skill={skill} index={index} key={skill.id} />)}</div></div></section>;
}

function SkillPage({ skillId }) {
  const skill = workSkills.find((item) => item.id === skillId);
  const heroVideo = skillId === 'film' ? featuredProjects[0].media[0] : skillId === 'motion' ? featuredProjects[2].media[0] : null;
  const heroVideoStart = skillId === 'film' ? 6 : 3;
  const heroRef = useRef(null);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  usePageMotion(skillId);
  useEffect(() => {
    if (!window.location.hash) return undefined;
    const frame = window.requestAnimationFrame(() => document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView());
    return () => window.cancelAnimationFrame(frame);
  }, [skillId]);
  useEffect(() => {
    if (!heroVideo) return undefined;
    const video = heroRef.current?.querySelector('.skill-hero-video');
    if (!video) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && video.dataset.ready === 'true') video.play().catch(() => {});
      else video.pause();
    }, { threshold: .1 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [heroVideo]);
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const hero = heroRef.current;
    const context = gsap.context(() => {
      const routeOverlay = document.querySelector('.experience-transition');
      const delay = routeOverlay && getComputedStyle(routeOverlay).display !== 'none' ? .48 : .05;
      const characterCount = hero.querySelectorAll('.masked-title-char').length;
      const lastCharacterAt = .32 + (characterCount - 1) * .045;
      gsap.timeline({ delay, defaults: { ease: 'power3.out' } })
        .from('.skill-hero-image', { scale: 1.12, duration: 1.4 }, 0)
        .from('.skill-hero-overline > *', { autoAlpha: 0, y: -18, duration: .65, stagger: .08 }, .12)
        .from('.skill-hero-kicker', { autoAlpha: 0, y: 20, duration: .65 }, .2)
        .from('.masked-title-char', { yPercent: 125, rotateX: -25, transformOrigin: '50% 100%', duration: .85, ease: 'power4.out', stagger: .045 }, .32)
        .from('.masked-title-dot', { autoAlpha: 0, scale: 0, rotation: -60, transformOrigin: '50% 75%', ease: 'back.out(2)', duration: .55 }, lastCharacterAt + .32)
        .from('.skill-hero-main p', { autoAlpha: 0, y: 25, duration: .75 }, lastCharacterAt + .22)
        .from('.skill-hero-bottom > span', { autoAlpha: 0, y: 16, duration: .6, stagger: .08 }, lastCharacterAt + .48);
      const slides = gsap.utils.toArray('.skill-hero-slide');
      if (slides.length > 1) {
        gsap.set(slides, { autoAlpha: 0, scale: 1.04 });
        gsap.set(slides[0], { autoAlpha: 1 });
        const slideshow = gsap.timeline({ paused: true, repeat: -1 });
        slides.forEach((slide, index) => {
          const start = index * 6;
          const next = slides[(index + 1) % slides.length];
          slideshow.to(slide, { scale: 1.16, duration: 6, ease: 'none' }, start)
            .to(next, { autoAlpha: 1, duration: 1.3, ease: 'power2.inOut' }, start + 4.7)
            .set(slide, { autoAlpha: 0, scale: 1.04 }, start + 6);
        });
        ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onEnter: () => slideshow.play(), onEnterBack: () => slideshow.play(), onLeave: () => slideshow.pause(), onLeaveBack: () => slideshow.pause() });
      }
      gsap.to('.skill-hero-image', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }, hero);
    return () => context.revert();
  }, [skillId]);
  return <div className={`inner-page skill-page skill-page--${skill.id}`}><SiteNav current="work" /><main>
    <section className="skill-hero" ref={heroRef} aria-labelledby="skill-title"><div className="skill-hero-image">{skill.slides ? skill.slides.map((src, index) => <img className="skill-hero-slide" src={src} alt="" loading={index === 0 ? "eager" : "lazy"} key={src} />) : <img src={skill.cover} alt="" />}{heroVideo && <video className={`skill-hero-video ${heroVideoReady ? 'is-ready' : ''}`} src={heroVideo.src} muted playsInline preload="metadata" poster={skill.cover} aria-hidden="true" onLoadedMetadata={(event) => { const video = event.currentTarget; video.currentTime = video.duration > heroVideoStart + 2 ? heroVideoStart : Math.max(0, video.duration * .2); }} onSeeked={(event) => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const video = event.currentTarget; video.dataset.ready = 'true'; setHeroVideoReady(true); if (video.getBoundingClientRect().bottom > 0 && video.getBoundingClientRect().top < window.innerHeight) video.play().catch(() => {}); }} onEnded={(event) => { const video = event.currentTarget; video.currentTime = video.duration > heroVideoStart + 2 ? heroVideoStart : Math.max(0, video.duration * .2); }} />}</div><div className="skill-hero-shade" /><div className="skill-hero-content experience-shell"><div className="skill-hero-overline"><a href="/#my-work">← ALL SKILLS</a><span>{String(workSkills.indexOf(skill) + 1).padStart(2, '0')} / {String(workSkills.length).padStart(2, '0')}</span></div><div className="skill-hero-main"><span className="skill-hero-kicker">AASHISH MAHATO / MY WORK</span><MaskedHeroTitle text={skill.name} id="skill-title" /><p>{skill.line}</p></div><div className="skill-hero-bottom"><span>SELECTED PROJECTS BELOW</span><span>SCROLL ↓</span></div></div></section>
    <section className={`work-detail work-detail--${skill.id}`}><div className="experience-shell"><nav className="work-detail-switcher" aria-label="Explore other skills">{workSkills.map((item) => <a href={`/work/${item.id}/`} key={item.id} aria-current={skill.id === item.id ? 'page' : undefined}>{item.name}</a>)}</nav><div className="work-detail-heading" data-reveal><span>{skill.name} / THE PRACTICE</span><h2>THE WORK<i>.</i></h2><p>{skill.line}</p><div className="work-detail-capabilities" aria-label={`${skill.name} skills`}>{skill.capabilities.map((capability) => <span key={capability}>{capability}</span>)}</div></div><div className="work-project-grid">{skill.projects.map((project, index) => <WorkProjectCard project={project} index={index} skillId={skill.id} key={project.id} />)}</div>{skill.id === 'web' && <div className="github-proof" data-reveal><div className="github-proof-heading"><div><span>PUBLIC GITHUB ACTIVITY / SEPTEMBER 2026 SNAPSHOT</span><h3>THE WORK<br /><em>BEHIND THE WORK.</em></h3><p>A snapshot of my GitHub contribution activity. Visit my profile for the latest projects and activity.</p></div><a href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer">VIEW GITHUB ↗</a></div><a className="github-proof-image" href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer" aria-label="View current GitHub contribution activity"><img src="/media/github-contributions-2026-09.png" alt="Screenshot of Aashish Mahato's GitHub contribution graph in September 2026" loading="lazy" /></a></div>}<div className="skill-page-end"><a href="/#my-work">← ALL SKILLS</a><a href="/gallery/">FULL GALLERY ↗</a></div></div></section>
  </main><SiteFooter /></div>;
}

function GalleryPage() {
  const [filter, setFilter] = useState('all');
  const [photo, setPhoto] = useState(null);
  const pageRef = useRef(null);
  const gridRef = useRef(null);
  const lightboxRef = useRef(null);
  const filterTweenRef = useRef(null);
  const filterBusyRef = useRef(false);
  const photoTriggerRef = useRef(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const titleCharacters = gsap.utils.toArray('.gallery-intro .masked-title-char');
        const routeOverlay = document.querySelector('.experience-transition');
        const delay = routeOverlay && getComputedStyle(routeOverlay).display !== 'none' ? .55 : .08;
        gsap.timeline({ delay, defaults: { ease: 'power4.out' } })
          .from(titleCharacters, { yPercent: 125, rotateX: -25, transformOrigin: '50% 100%', duration: .9, stagger: .055 }, .16)
          .from('.gallery-intro .masked-title-dot', { autoAlpha: 0, scale: 0, rotation: -60, duration: .55, ease: 'back.out(2)' }, .78)
          .from('.gallery-intro .experience-section-top', { autoAlpha: 0, y: -18, duration: .65 }, 0)
          .from('.gallery-intro > p', { autoAlpha: 0, y: 28, duration: .8 }, .8);
      }, pageRef);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const cards = Array.from(grid.querySelectorAll('.gallery-piece'));
        cards.forEach((card, index) => {
          const visual = card.querySelector('.gallery-piece-media');
          const caption = card.querySelector('.gallery-piece-caption');
          gsap.set(card, { autoAlpha: 0, y: 72, x: index % 2 ? 24 : -24 });
          gsap.set(visual, { clipPath: 'inset(0 0 18% 0)' });
          gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%', once: true } })
            .to(card, { autoAlpha: 1, y: 0, x: 0, duration: .95, delay: index % 2 ? .1 : 0, ease: 'power3.out' })
            .to(visual, { clipPath: 'inset(0 0 0% 0)', duration: 1.05, ease: 'power3.out' }, '<')
            .from(caption, { autoAlpha: 0, y: 20, duration: .55, ease: 'power2.out' }, '<.35');
        });
      }, grid);
      const refresh = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => { window.cancelAnimationFrame(refresh); context.revert(); };
    });
    return () => media.revert();
  }, [filter]);

  useLayoutEffect(() => {
    if (!photo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(lightboxRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: .38, ease: 'power2.out' });
      gsap.fromTo('.gallery-lightbox img', { scale: .9, y: 42 }, { scale: 1, y: 0, duration: .7, ease: 'power3.out' });
      gsap.from('.gallery-lightbox-meta', { autoAlpha: 0, y: 16, duration: .5, delay: .2 });
    }, lightboxRef);
    return () => context.revert();
  }, [photo]);

  useEffect(() => () => filterTweenRef.current?.kill(), []);

  const closePhoto = () => {
    const finish = () => { setPhoto(null); window.requestAnimationFrame(() => photoTriggerRef.current?.focus()); };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !lightboxRef.current) { finish(); return; }
    gsap.to(lightboxRef.current, { autoAlpha: 0, duration: .25, ease: 'power2.in', onComplete: finish });
  };

  useEffect(() => {
    if (!photo) return undefined;
    const onEscape = (event) => { if (event.key === 'Escape') closePhoto(); };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [photo]);

  const changeFilter = (next) => {
    if (next === filter || filterBusyRef.current) return;
    const cards = gridRef.current?.querySelectorAll('.gallery-piece');
    if (!cards?.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setFilter(next); return; }
    filterBusyRef.current = true;
    filterTweenRef.current = gsap.to(cards, {
      autoAlpha: 0, y: -25, duration: .28, stagger: { each: .018, from: 'end' },
      ease: 'power2.inOut', onComplete: () => { setFilter(next); filterBusyRef.current = false; },
    });
  };

  const animateHover = (event, active) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const image = event.currentTarget.querySelector('img');
    if (image) gsap.to(image, { filter: active ? 'brightness(1.1)' : 'brightness(1)', duration: .35, ease: 'power2.out', overwrite: 'auto' });
  };

  const combined = [...galleryMedia, ...featuredProjects.flatMap((project) => (project.media || []).map((item,index) => ({ ...item, id: item.id || `${project.id}-${index}`, title: item.title || project.title })))];
  const allMedia = combined.filter((item, index) => combined.findIndex((other) => other.src === item.src) === index);
  const allPhotos = allMedia.filter((item) => item.type === 'photo');
  const items = allMedia.filter((item) => filter === 'all' || (filter === 'video' && item.type === 'video') || (filter === 'photography' && item.category === 'Photography') || (filter === 'design' && item.type === 'photo' && item.category !== 'Photography'));

  return <div className="inner-page gallery-page" ref={pageRef}>
    <SiteNav current="gallery" />
    <main>
      <section className="inner-intro gallery-intro experience-shell"><SectionTop number="01" label="GALLERY" aside="WATCH / VIEW / EXPLORE" /><GalleryLetterTitle /><p>Moving images and still frames across photography, film, branding, and graphic design.</p></section>
      <GalleryCinematic items={allMedia} />
      <section className="gallery-content experience-shell" id="gallery-library"><div className="gallery-library-heading"><span>THE FULL ARCHIVE / PHOTOS & FILMS</span><h2>THE <em>ARCHIVE.</em></h2><p>Explore every frame. Open a photograph or play a film.</p></div><div className="gallery-controls"><span aria-live="polite">{String(items.length).padStart(2, '0')} PIECES</span><div role="group" aria-label="Gallery filter">{[['all','ALL'],['video','FILMS'],['photography','PHOTOS'],['design','DESIGN']].map(([value,label])=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>changeFilter(value)}>{label}</button>)}</div></div><div className="gallery-grid" ref={gridRef}>{items.map((item, index)=><article className="gallery-piece" id={`gallery-item-${item.id}`} key={item.id}><div className="gallery-piece-media">{item.type==='video'?<ReelVideo item={item} controls />:<button type="button" onPointerEnter={(event)=>animateHover(event,true)} onPointerLeave={(event)=>animateHover(event,false)} onClick={(event)=>{photoTriggerRef.current=event.currentTarget;setPhoto(item)}} aria-label={`Open ${item.title}`}><img src={item.src} alt={item.title} loading="lazy" /><span>EXPAND ↗</span></button>}</div><div className="gallery-piece-caption"><span>{String(index+1).padStart(2,'0')} / {item.category || item.type.toUpperCase()}</span><h2>{item.title}</h2></div></article>)}</div></section>
      <GalleryIsometricWave items={allMedia} />
      <GalleryFinalGrid photos={allPhotos} />
    </main>
    <SiteFooter />
    {photo && <div className="gallery-lightbox" ref={lightboxRef} role="dialog" aria-modal="true" aria-label={photo.title} onMouseDown={(event)=>{if(event.target===event.currentTarget)closePhoto()}}><button type="button" onClick={closePhoto} aria-label="Close photo">CLOSE ×</button><img src={photo.src} alt={photo.title}/><div className="gallery-lightbox-meta"><span>{photo.category || 'VISUAL ARCHIVE'}</span><strong>{photo.title}</strong></div></div>}
  </div>;
}

function AboutPage() {
  return <div className="inner-page about-page"><SiteNav current="about" /><main><AboutOpening /><AboutTimeline /><AboutAfterTimeline /></main><SiteFooter /></div>;
}

export default function Experience() {
  const [route, setRoute] = useState(() => routeFor(window.location.pathname));
  const current = useRef(route);
  const overlay = useRef(null);
  const inTransition = useRef(false);
  const lenisRef = useRef(null);

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lenis = reducedMotion.matches ? null : new Lenis({ autoRaf: true, anchors: true, smoothWheel: true, duration: 1.05 });
    lenisRef.current = lenis;
    const onScroll = () => ScrollTrigger.update();
    lenis?.on('scroll', onScroll);
    return () => { lenis?.off('scroll', onScroll); lenis?.destroy(); lenisRef.current = null; window.history.scrollRestoration = previousRestoration; };
  }, []);

  useEffect(() => {
    if (!window.location.hash) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target && lenisRef.current) lenisRef.current.scrollTo(target, { immediate: true, force: true });
      else target?.scrollIntoView();
      ScrollTrigger.refresh();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const moveTo = (url, push) => {
      const next = routeFor(url.pathname);
      if (next === current.current) { if (push) window.history.pushState({}, '', url); return; }
      if (inTransition.current) return;
      inTransition.current = true;
      const mask = overlay.current;
      const swap = () => {
        if (push) window.history.pushState({}, '', url);
        current.current = next;
        flushSync(() => setRoute(next));
        updateSearchMeta(next);
        if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true, force: true });
        else window.scrollTo(0, 0);
        window.requestAnimationFrame(() => {
          if (url.hash) {
            const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
            if (target && lenisRef.current) lenisRef.current.scrollTo(target, { immediate: true, force: true });
            else target?.scrollIntoView();
          }
          ScrollTrigger.refresh();
        });
      };
      const finish = () => {
        gsap.set(mask, { clearProps: 'all' });
        inTransition.current = false;
        if (routeFor(window.location.pathname) !== current.current) moveTo(new URL(window.location.href), false);
      };
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { swap(); finish(); return; }
      gsap.timeline({ onComplete: finish }).set(mask, { display: 'grid', yPercent: 101, pointerEvents: 'auto' }).to(mask, { yPercent: 0, duration: .48, ease: 'power4.inOut' }).call(swap).to(mask, { yPercent: -101, duration: .62, ease: 'power4.inOut' }, '+=.12');
    };
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const link = event.target.closest('a[href]');
      if (!link || link.target && link.target !== '_self' || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !(/^\/work\/(?:film|photography|motion|branding|graphic|digital|web)\/$/.test(url.pathname) || ['/','/gallery/','/about/'].includes(url.pathname)) || routeFor(url.pathname) === current.current) return;
      event.preventDefault();
      moveTo(url, true);
    };
    const onPop = () => moveTo(new URL(window.location.href), false);
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPop);
    return () => { document.removeEventListener('click', onClick); window.removeEventListener('popstate', onPop); };
  }, []);

  const Page = route.startsWith('skill-') ? SkillPage : { home: Home, gallery: GalleryPage, about: AboutPage }[route];
  return <><div key={route}><Page skillId={route.startsWith('skill-') ? route.slice(6) : undefined} lenisRef={lenisRef} /></div><div className="experience-transition" ref={overlay} aria-hidden="true"><span>A/M<small>®</small></span><i /><p>IMAGE · MOTION · DESIGN · CODE</p></div></>;
}
