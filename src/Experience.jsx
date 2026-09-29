import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, stagger } from 'animejs';
import App from './App.jsx';
import { Cursor, CursorFollow, CursorProvider } from './components/animate-ui/components/animate/cursor.jsx';
import { PreviewLinkCard, PreviewLinkCardContent, PreviewLinkCardImage, PreviewLinkCardPortal, PreviewLinkCardTrigger } from './components/animate-ui/primitives/radix/preview-link-card.jsx';
import { collaborators, featuredProjects, galleryMedia, heroReel, webProjects } from './portfolio-data.js';

gsap.registerPlugin(ScrollTrigger);

const routeFor = (path) => {
  const skill = path.match(/^\/work\/(film|photography|motion|branding|graphic|digital|web)\/?$/);
  if (skill) return `skill-${skill[1]}`;
  return path.startsWith('/gallery') ? 'gallery' : path.startsWith('/about') ? 'about' : 'home';
};
const titles = { home: 'Aashish Mahato — Creative Portfolio', gallery: 'Gallery — Aashish Mahato', about: 'About — Aashish Mahato' };
const skillTitles = { film: 'Film', photography: 'Photography', motion: 'Motion Graphics', branding: 'Branding', graphic: 'Graphic Design', digital: 'Digital', web: 'Web Development' };
const titleFor = (route) => route.startsWith('skill-') ? `${skillTitles[route.slice(6)]} — Aashish Mahato` : titles[route];

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

function SiteFooter() {
  return <footer className="experience-footer"><a href="/" className="footer-logo">A/M<span>®</span></a><p>IMAGE · MOTION · DESIGN · CODE</p><a href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer">GITHUB ↗</a><span>© 2026 AASHISH MAHATO</span></footer>;
}

function CollaboratorMark({ company }) {
  return <div className="collaborator-mark" style={{ '--brand-color': company.color, '--brand-ink': company.ink || '#fff' }}><img src={company.logo} alt={`${company.name} logo`} loading="lazy" /><CursorProvider><Cursor className="collaborator-cursor" /><CursorFollow className="collaborator-cursor-label" side="bottom" sideOffset={12} align="start" alignOffset={8}>{company.name}</CursorFollow></CursorProvider></div>;
}

function CollaboratorMarqueeRow({ companies, reverse = false }) {
  return <div className="collaborator-marquee"><div className={`collaborator-track ${reverse ? 'collaborator-track--reverse' : ''}`}>{[0, 1, 2].map((copy) => <div className="collaborator-group" key={copy} aria-hidden={copy > 0}>{companies.map((company) => <CollaboratorMark key={company.name} company={company} />)}</div>)}</div></div>;
}

function HomeCollaborators() {
  const midpoint = Math.ceil(collaborators.length / 2);
  return <section className="home-collaborators" aria-labelledby="home-collaborators-title"><div className="experience-shell"><SectionTop number="04" label="COLLABORATIONS" aside="NAMES FROM THE WORK" /><div className="home-collaborators-heading" data-reveal><h2 id="home-collaborators-title">WORKED<br /><em>WITH.</em></h2><p>Selected teams and brands I've worked with.</p></div></div><div className="collaborator-marquees" aria-label="Company logos"><CollaboratorMarqueeRow companies={collaborators.slice(0, midpoint)} reverse /><CollaboratorMarqueeRow companies={collaborators.slice(midpoint)} /></div></section>;
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

function Home() {
  const galleryStage = useRef(null);
  usePageMotion('home');
  const previewMedia = [
    ...galleryMedia,
    ...featuredProjects.flatMap((project) => (project.media || []).map((item, index) => ({ ...item, id: `${project.id}-${index}`, title: item.title || project.title }))),
  ].slice(0, 6);
  if (previewMedia.length < 3) previewMedia.push({ id: 'next-frame', type: 'placeholder', title: 'YOUR NEXT FRAME' });

  useLayoutEffect(() => {
    const stage = galleryStage.current;
    const viewport = stage?.querySelector('.home-gallery-viewport');
    const track = stage?.querySelector('.home-gallery-track');
    const fill = stage?.querySelector('.home-gallery-progress-fill');
    const count = stage?.querySelector('.home-gallery-progress-count');
    if (!stage || !viewport || !track || !fill || !count) return undefined;
    const total = track.children.length;
    const visuals = track.querySelectorAll('.home-gallery-slide img, .home-gallery-slide video');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const update = (progress) => {
      fill.style.transform = `scaleX(${progress})`;
      count.textContent = `${String(Math.min(total, Math.floor(progress * total) + 1)).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      if (!reducedMotion) gsap.set(visuals, { objectPosition: `${100 - progress * 100}% center` });
    };
    const onNativeScroll = () => update(viewport.scrollLeft / Math.max(1, viewport.scrollWidth - viewport.clientWidth));
    viewport.addEventListener('scroll', onNativeScroll, { passive: true });
    const media = gsap.matchMedia();
    media.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
      const drag = { pointerId: null, startX: 0, startProgress: 0, moved: false };
      let scrollAnimation;
      const context = gsap.context(() => {
        scrollAnimation = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
            start: 'top 12%',
            end: () => `+=${Math.max(1, distance())}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => update(progress),
          },
        });
      }, stage);
      const onPointerDown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        if (event.target.closest('a, button, input, video[controls]')) return;
        drag.pointerId = event.pointerId;
        drag.startX = event.clientX;
        drag.startProgress = scrollAnimation.scrollTrigger.progress;
        drag.moved = false;
        viewport.setPointerCapture(event.pointerId);
        viewport.classList.add('is-dragging');
      };
      const onPointerMove = (event) => {
        if (drag.pointerId !== event.pointerId) return;
        const delta = drag.startX - event.clientX;
        if (Math.abs(delta) > 4) drag.moved = true;
        if (!drag.moved) return;
        event.preventDefault();
        const trigger = scrollAnimation.scrollTrigger;
        const progress = gsap.utils.clamp(0, 1, drag.startProgress + delta / (viewport.clientWidth * .85));
        trigger.scroll(trigger.start + progress * (trigger.end - trigger.start));
      };
      const onPointerUp = (event) => {
        if (drag.pointerId !== event.pointerId) return;
        drag.pointerId = null;
        viewport.classList.remove('is-dragging');
        if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      };
      viewport.addEventListener('pointerdown', onPointerDown);
      viewport.addEventListener('pointermove', onPointerMove);
      viewport.addEventListener('pointerup', onPointerUp);
      viewport.addEventListener('pointercancel', onPointerUp);
      const refresh = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        window.cancelAnimationFrame(refresh);
        viewport.removeEventListener('pointerdown', onPointerDown);
        viewport.removeEventListener('pointermove', onPointerMove);
        viewport.removeEventListener('pointerup', onPointerUp);
        viewport.removeEventListener('pointercancel', onPointerUp);
        viewport.classList.remove('is-dragging');
        context.revert();
        gsap.set(visuals, { clearProps: 'objectPosition' });
        update(0);
      };
    });
    media.add('(prefers-reduced-motion: no-preference)', () => {
      let entrance;
      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          entrance = animate([
            stage.querySelector('.home-gallery-slide:first-child .home-gallery-slide-caption'),
            stage.querySelector('.home-gallery-progress > span:first-child'),
          ], { opacity: [0, 1], translateY: [22, 0], delay: stagger(140), duration: 850, ease: 'out(3)' });
        },
      });
      return () => { trigger.kill(); entrance?.revert(); };
    });
    return () => { viewport.removeEventListener('scroll', onNativeScroll); media.revert(); };
  }, []);

  return <><App /><main>
    <section className="home-gallery" id="home-gallery" aria-labelledby="home-gallery-title">
      <div className="experience-shell"><SectionTop number="01" label="THE MOVING IMAGE" aside="A VISUAL FIRST LOOK" /><div className="home-gallery-heading" data-reveal><span>THE PORTFOLIO IN FRAMES</span><h2 id="home-gallery-title">THE WORK<br /><em>MOVES.</em></h2><p>Film, photographs, and the ideas between them. Start with the reel; the full visual archive has its own space.</p></div></div>
      <div className="home-gallery-stage" ref={galleryStage} aria-label="Horizontal portfolio gallery"><div className="home-gallery-viewport"><div className="home-gallery-track">{previewMedia.map((item, index) => <article className={`home-gallery-slide home-gallery-slide--${item.type}`} key={item.id}>{item.type === 'video' ? <ReelVideo item={item} /> : item.type === 'photo' ? <img src={item.src} alt={item.title} loading="lazy" draggable="false" /> : <div className="home-gallery-empty"><span>AN OPEN FRAME</span><strong>{String(index + 1).padStart(2, '0')}<i>.</i></strong><small>PHOTO PLACEHOLDER</small></div>}<div className="home-gallery-slide-caption"><span>{String(index + 1).padStart(2, '0')} / {item.type === 'placeholder' ? 'COMING SOON' : item.type.toUpperCase()}</span><h3>{item.title}</h3></div></article>)}</div></div><div className="home-gallery-progress"><span><span className="home-gallery-prompt-desktop">DRAG OR SCROLL TO EXPLORE</span><span className="home-gallery-prompt-touch">SWIPE TO EXPLORE</span></span><span className="home-gallery-progress-track"><span className="home-gallery-progress-fill" /></span><span className="home-gallery-progress-count">01 / {String(previewMedia.length).padStart(2, '0')}</span></div></div>
      <div className="experience-shell"><a className="experience-text-link" href="/gallery/">ENTER THE FULL GALLERY <span>↗</span></a></div>
    </section>

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
  { id: 'photography', name: 'PHOTOGRAPHY', line: 'Still images that hold a moment.', cover: photographyProjects[0].cover, preview: photographyProjects[1].cover, capabilities: ['Composition', 'Portraits', 'Landscape'], projects: photographyProjects },
  { id: 'motion', name: 'MOTION GRAPHICS', line: 'Design and ideas brought into movement.', cover: featuredProjects[2].cover, preview: featuredProjects[2].cover, capabilities: ['Animation', 'Motion design', 'Editing'], projects: featuredProjects.filter((project) => project.category === 'Motion Graphics') },
  { id: 'branding', name: 'BRANDING', line: 'Visual systems built for a name and an idea.', cover: featuredProjects[3].cover, preview: featuredProjects[4].cover, capabilities: ['Visual identity', 'Art direction', 'Brand mockups'], projects: featuredProjects.filter((project) => project.category === 'Brand & Digital') },
  { id: 'graphic', name: 'GRAPHIC DESIGN', line: 'Clear visual communication across formats.', cover: featuredProjects[5].cover, preview: featuredProjects[5].media[1].src, capabilities: ['Campaign graphics', 'Social design', 'Layout'], projects: featuredProjects.filter((project) => project.category === 'Graphic Design') },
  { id: 'digital', name: 'DIGITAL', line: 'Interfaces and digital concepts shaped with design.', cover: featuredProjects[3].media.find((item) => item.category === 'Digital').src, preview: featuredProjects[4].media.find((item) => item.category === 'Digital').src, capabilities: ['Web design', 'UI concepts', 'Frontend'], projects: featuredProjects.filter((project) => project.category === 'Brand & Digital') },
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
    {skillId === 'web' && <div className="web-project-links"><a href={project.liveUrl} target="_blank" rel="noopener noreferrer">VISIT SITE ↗</a>{project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">VIEW CODE ↗</a>}</div>}
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
      gsap.timeline({ delay, defaults: { ease: 'power3.out' } })
        .from('.skill-hero-image', { scale: 1.12, duration: 1.4 }, 0)
        .from('.skill-hero-content h1', { autoAlpha: 0, y: 70, duration: 1 }, .18)
        .from('.skill-hero-content p', { autoAlpha: 0, y: 25, duration: .7 }, .5)
        .from('.skill-hero-overline, .skill-hero-bottom', { autoAlpha: 0, y: 15, duration: .6, stagger: .08 }, .58);
      gsap.to('.skill-hero-image', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }, hero);
    return () => context.revert();
  }, [skillId]);
  return <div className={`inner-page skill-page skill-page--${skill.id}`}><SiteNav current="work" /><main>
    <section className="skill-hero" ref={heroRef} aria-labelledby="skill-title"><div className="skill-hero-image"><img src={skill.cover} alt="" />{heroVideo && <video className={`skill-hero-video ${heroVideoReady ? 'is-ready' : ''}`} src={heroVideo.src} muted playsInline preload="metadata" poster={skill.cover} aria-hidden="true" onLoadedMetadata={(event) => { const video = event.currentTarget; video.currentTime = video.duration > heroVideoStart + 2 ? heroVideoStart : Math.max(0, video.duration * .2); }} onSeeked={(event) => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const video = event.currentTarget; video.dataset.ready = 'true'; setHeroVideoReady(true); if (video.getBoundingClientRect().bottom > 0 && video.getBoundingClientRect().top < window.innerHeight) video.play().catch(() => {}); }} onEnded={(event) => { const video = event.currentTarget; video.currentTime = video.duration > heroVideoStart + 2 ? heroVideoStart : Math.max(0, video.duration * .2); }} />}</div><div className="skill-hero-shade" /><div className="skill-hero-content experience-shell"><div className="skill-hero-overline"><a href="/#my-work">← ALL SKILLS</a><span>{String(workSkills.indexOf(skill) + 1).padStart(2, '0')} / {String(workSkills.length).padStart(2, '0')}</span></div><div><span className="skill-hero-kicker">AASHISH MAHATO / MY WORK</span><h1 id="skill-title">{skill.name}<i>.</i></h1><p>{skill.line}</p></div><div className="skill-hero-bottom"><span>SELECTED PROJECTS BELOW</span><span>SCROLL ↓</span></div></div></section>
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
        const titleLines = gsap.utils.toArray('.gallery-title-line > span');
        const routeOverlay = document.querySelector('.experience-transition');
        const delay = routeOverlay && getComputedStyle(routeOverlay).display !== 'none' ? .55 : .08;
        gsap.timeline({ delay, defaults: { ease: 'power4.out' } })
          .from(titleLines, { yPercent: 110, rotate: 3, duration: 1.15, stagger: .13 })
          .from('.gallery-intro .experience-section-top', { autoAlpha: 0, y: -18, duration: .65 }, 0)
          .from('.gallery-intro > p', { autoAlpha: 0, y: 28, duration: .8 }, .45);
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
    media.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        Array.from(grid.querySelectorAll('.gallery-piece')).forEach((card) => {
          const image = card.querySelector('.gallery-piece-media img');
          if (!image) return;
          gsap.fromTo(image, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      }, grid);
      return () => context.revert();
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
    if (image) gsap.to(image, { scale: active ? 1.09 : 1, duration: active ? .75 : .6, ease: 'power3.out', overwrite: 'auto' });
  };

  const combined = [...galleryMedia, ...featuredProjects.flatMap((project) => (project.media || []).map((item,index) => ({ ...item, id: item.id || `${project.id}-${index}`, title: item.title || project.title })))];
  const allMedia = combined.filter((item, index) => combined.findIndex((other) => other.src === item.src) === index);
  const items = allMedia.filter((item) => filter === 'all' || (filter === 'video' && item.type === 'video') || (filter === 'photography' && item.category === 'Photography') || (filter === 'design' && item.type === 'photo' && item.category !== 'Photography'));

  return <div className="inner-page gallery-page" ref={pageRef}>
    <SiteNav current="gallery" />
    <main>
      <section className="inner-intro gallery-intro experience-shell"><SectionTop number="01" label="GALLERY" aside="WATCH / VIEW / EXPLORE" /><h1 className="gallery-intro-title"><span className="gallery-title-line"><span>THE</span></span><span className="gallery-title-line"><span>GALLERY<i>.</i></span></span></h1><p>Moving images and still frames across photography, film, branding, and graphic design.</p></section>
      <section className="gallery-content experience-shell"><div className="gallery-controls"><span aria-live="polite">{String(items.length).padStart(2, '0')} PIECES</span><div role="group" aria-label="Gallery filter">{[['all','ALL'],['video','FILMS'],['photography','PHOTOS'],['design','DESIGN']].map(([value,label])=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>changeFilter(value)}>{label}</button>)}</div></div><div className="gallery-grid" ref={gridRef}>{items.map((item, index)=><article className="gallery-piece" key={item.id}><div className="gallery-piece-media">{item.type==='video'?<ReelVideo item={item} controls />:<button type="button" onPointerEnter={(event)=>animateHover(event,true)} onPointerLeave={(event)=>animateHover(event,false)} onClick={(event)=>{photoTriggerRef.current=event.currentTarget;setPhoto(item)}} aria-label={`Open ${item.title}`}><img src={item.src} alt={item.title} loading="lazy" /><span>EXPAND ↗</span></button>}</div><div className="gallery-piece-caption"><span>{String(index+1).padStart(2,'0')} / {item.category || item.type.toUpperCase()}</span><h2>{item.title}</h2></div></article>)}</div></section>
    </main>
    <SiteFooter />
    {photo && <div className="gallery-lightbox" ref={lightboxRef} role="dialog" aria-modal="true" aria-label={photo.title} onMouseDown={(event)=>{if(event.target===event.currentTarget)closePhoto()}}><button type="button" onClick={closePhoto} aria-label="Close photo">CLOSE ×</button><img src={photo.src} alt={photo.title}/><div className="gallery-lightbox-meta"><span>{photo.category || 'VISUAL ARCHIVE'}</span><strong>{photo.title}</strong></div></div>}
  </div>;
}

function AboutPage() {
  usePageMotion('about');
  return <div className="inner-page about-page"><SiteNav current="about" /><main><section className="inner-intro experience-shell"><SectionTop number="01" label="ABOUT" aside="THE PERSON BEHIND THE FRAME" /><h1 data-reveal>WHO I AM<span>.</span></h1><p data-reveal>I'm Aashish Mahato, a 20-year-old multidisciplinary creative working across film, photography, design, and digital experiences.</p></section><section className="about-statement experience-shell"><div data-reveal><span>WHY WORK WITH ME</span><h2>ONE IDEA.<br /><em>NO SINGLE</em><br />FORMAT.</h2></div><div data-reveal><p>The strongest idea may need more than one medium. I can see it as a frame, shape it in motion, and carry its visual language into digital space.</p><p>I stay with the details and keep refining until the result meets the client's expectations and my own standards.</p></div></section><section className="about-capabilities experience-shell"><SectionTop number="02" label="CAPABILITIES" aside="HOW I MAKE THINGS" /><div>{[['01','IMAGE','Photography · Videography'],['02','MOTION','Editing · Motion graphics'],['03','DESIGN','Identity · Graphic design'],['04','DIGITAL','Web · Apps · Creative technology']].map(([number,title,detail])=><div className="capability-line" key={number} data-reveal><span>{number}</span><h3>{title}</h3><p>{detail}</p></div>)}</div></section><section className="about-collaborators experience-shell"><SectionTop number="03" label="COLLABORATIONS" aside="COMPANIES & BRANDS" /><div className="about-collaborators-heading" data-reveal><h2>WORKED<br /><em>WITH.</em></h2><p>Selected teams and brands I've worked with.</p></div><div className="collaborator-grid">{collaborators.map((company)=><CollaboratorMark key={company.name} company={company}/>)}</div></section></main><SiteFooter /></div>;
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
        document.title = titleFor(next);
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
  return <><div key={route}><Page skillId={route.startsWith('skill-') ? route.slice(6) : undefined} /></div><div className="experience-transition" ref={overlay} aria-hidden="true"><span>A/M<small>®</small></span><i /><p>IMAGE · MOTION · DESIGN · CODE</p></div></>;
}
