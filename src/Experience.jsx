import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import App from './App.jsx';
import { featuredProjects, galleryMedia, heroReel } from './portfolio-data.js';

gsap.registerPlugin(ScrollTrigger);

const routeFor = (path) => path.startsWith('/work') ? 'work' : path.startsWith('/gallery') ? 'gallery' : path.startsWith('/about') ? 'about' : 'home';
const titles = { home: 'Aashish Mahato — Creative Portfolio', work: 'Work — Aashish Mahato', gallery: 'Gallery — Aashish Mahato', about: 'About — Aashish Mahato' };

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
  return <header className="inner-nav"><a className="inner-logo" href="/" aria-label="Aashish Mahato home">A/M<span>®</span></a><nav aria-label="Main navigation"><a href="/work/" aria-current={current === 'work' ? 'page' : undefined}>Work</a><a href="/gallery/" aria-current={current === 'gallery' ? 'page' : undefined}>Gallery</a><a href="/about/" aria-current={current === 'about' ? 'page' : undefined}>About</a></nav><a className="inner-home" href="/">BACK HOME ↗</a></header>;
}

function SectionTop({ number, label, aside }) {
  return <div className="experience-section-top"><span>{number} / {label}</span><span>{aside}</span></div>;
}

function SiteFooter() {
  return <footer className="experience-footer"><a href="/" className="footer-logo">A/M<span>®</span></a><p>IMAGE · MOTION · DESIGN · CODE</p><a href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer">GITHUB ↗</a><span>© 2026 AASHISH MAHATO</span></footer>;
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
    const update = (progress) => {
      fill.style.transform = `scaleX(${progress})`;
      count.textContent = `${String(Math.min(total, Math.floor(progress * total) + 1)).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    };
    const onNativeScroll = () => update(viewport.scrollLeft / Math.max(1, viewport.scrollWidth - viewport.clientWidth));
    viewport.addEventListener('scroll', onNativeScroll, { passive: true });
    const media = gsap.matchMedia();
    media.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
      const context = gsap.context(() => {
        gsap.to(track, {
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
      const refresh = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => { window.cancelAnimationFrame(refresh); context.revert(); update(0); };
    });
    return () => { viewport.removeEventListener('scroll', onNativeScroll); media.revert(); };
  }, []);

  return <><App /><main>
    <section className="home-gallery" id="home-gallery" aria-labelledby="home-gallery-title">
      <div className="experience-shell"><SectionTop number="01" label="THE MOVING IMAGE" aside="A VISUAL FIRST LOOK" /><div className="home-gallery-heading" data-reveal><span>THE PORTFOLIO IN FRAMES</span><h2 id="home-gallery-title">THE WORK<br /><em>MOVES.</em></h2><p>Film, photographs, and the ideas between them. Start with the reel; the full visual archive has its own space.</p></div></div>
      <div className="home-gallery-stage" ref={galleryStage} aria-label="Horizontal portfolio gallery"><div className="home-gallery-viewport"><div className="home-gallery-track">{previewMedia.map((item, index) => <article className={`home-gallery-slide home-gallery-slide--${item.type}`} key={item.id}>{item.type === 'video' ? <ReelVideo item={item} /> : item.type === 'photo' ? <img src={item.src} alt={item.title} loading="lazy" /> : <div className="home-gallery-empty"><span>AN OPEN FRAME</span><strong>{String(index + 1).padStart(2, '0')}<i>.</i></strong><small>PHOTO PLACEHOLDER</small></div>}<div className="home-gallery-slide-caption"><span>{String(index + 1).padStart(2, '0')} / {item.type === 'placeholder' ? 'COMING SOON' : item.type.toUpperCase()}</span><h3>{item.title}</h3></div></article>)}</div></div><div className="home-gallery-progress"><span>SCROLL OR SWIPE TO EXPLORE</span><span className="home-gallery-progress-track"><span className="home-gallery-progress-fill" /></span><span className="home-gallery-progress-count">01 / {String(previewMedia.length).padStart(2, '0')}</span></div></div>
      <div className="experience-shell"><a className="experience-text-link" href="/gallery/">ENTER THE FULL GALLERY <span>↗</span></a></div>
    </section>

    <section className="home-about" aria-labelledby="home-about-title"><div className="experience-shell"><SectionTop number="02" label="THE PERSON" aside="A FEW WORDS BEFORE THE WORK" /><div className="home-about-grid"><div data-reveal><span className="experience-eyebrow">WHO I AM / WHY ME</span><h2 id="home-about-title">ONE IDEA.<br /><em>MANY WAYS</em><br />TO MAKE IT.</h2></div><div className="home-about-copy" data-reveal><span className="about-age">20 <small>YEARS OLD</small></span><p>I'm Aashish Mahato. I work across film, photography, design, and digital experiences. I follow an idea into the format that gives it the most life.</p><p>I keep refining a project until it meets the client's expectations and my own standards.</p><a className="experience-text-link" href="/about/">MORE ABOUT ME <span>↗</span></a></div></div></div></section>

    <section className="home-work" aria-labelledby="home-work-title"><div className="experience-shell"><SectionTop number="03" label="SELECTED WORK" aside="A SHORT PREVIEW" /><div className="home-work-heading" data-reveal><h2 id="home-work-title">A CLOSER<br /><em>LOOK.</em></h2><p>Each project deserves its own story. This is a glimpse before you explore the full work.</p></div><a href="/work/" className="home-feature" data-reveal><div className="home-feature-visual"><img src={featuredProjects[0]?.cover || heroReel.poster} alt={featuredProjects[0] ? `${featuredProjects[0].title} cover` : 'Current showreel cover'} loading="lazy" /><span>EXPLORE THE WORK ↗</span></div><div className="home-feature-info"><span>01 / {featuredProjects[0]?.category || 'FILM & MOTION'}</span><h3>{featuredProjects[0]?.title || 'THE SHOWREEL'}</h3><span>VIEW WORK ↗</span></div></a>{featuredProjects.length > 1 && <div className="home-project-list">{featuredProjects.slice(1,4).map((project,index)=><a href={`/work/#${project.id}`} key={project.id}><span>{String(index+2).padStart(2,'0')} / {project.category}</span><strong>{project.title}</strong><span>↗</span></a>)}</div>}{!featuredProjects.length && <p className="home-work-note">More project stories will appear here when the real work is added.</p>}<a className="experience-text-link" href="/work/">EXPLORE ALL WORK <span>↗</span></a></div></section>
    <SiteFooter />
  </main></>;
}

function WorkPage() {
  usePageMotion('work');
  return <div className="inner-page"><SiteNav current="work" /><main><section className="inner-intro experience-shell"><SectionTop number="01" label="WORK" aside="FILM · IMAGE · DESIGN · DIGITAL" /><h1 data-reveal>THE WORK<span>.</span></h1><p data-reveal>Projects made across mediums. Each story lives here with its own images, role, and context.</p></section><section className="work-feature experience-shell" aria-labelledby="work-feature-title"><div className="work-feature-heading" data-reveal><span>FEATURED / 001</span><h2 id="work-feature-title">CURRENT<br /><em>SHOWREEL.</em></h2></div><div className="work-feature-media" data-reveal><ReelVideo controls /></div><div className="work-feature-meta"><span>FILM & MOTION</span><p>A moving overview of my visual work. Play the complete reel above.</p><a href="/gallery/">OPEN GALLERY ↗</a></div></section>{featuredProjects.length ? <section className="project-stories experience-shell"><SectionTop number="02" label="PROJECT STORIES" aside={`${String(featuredProjects.length).padStart(2,'0')} PROJECTS`} />{featuredProjects.map((project,index)=><article className="project-story" id={project.id} key={project.id} data-reveal><div className="project-story-heading"><span>{String(index+1).padStart(2,'0')} / {project.category}</span><h2>{project.title}</h2><p>{project.description}</p></div>{project.cover&&<img src={project.cover} alt={`${project.title} cover`} loading="lazy"/>}<div className="project-story-meta"><span>{project.company || 'INDEPENDENT PROJECT'}</span><span>{project.year || ''}</span></div></article>)}</section> : <section className="future-work experience-shell"><SectionTop number="02" label="PROJECT STORIES" aside="IN PREPARATION" /><div className="future-work-line" data-reveal><span>COMING SOON</span><h2>THE BEST WORK<br />DESERVES DETAIL.</h2><p>Individual project stories will be added when the real project names, media, and details are ready.</p></div></section>}</main><SiteFooter /></div>;
}

function GalleryPage() {
  const [filter, setFilter] = useState('all');
  const [photo, setPhoto] = useState(null);
  usePageMotion('gallery');
  useEffect(() => {
    if (!photo) return undefined;
    const onEscape = (event) => { if (event.key === 'Escape') setPhoto(null); };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [photo]);
  const allMedia = [...galleryMedia, ...featuredProjects.flatMap((project) => (project.media || []).map((item,index) => ({ ...item, id: `${project.id}-${index}`, title: item.title || project.title })))];
  const items = allMedia.filter((item) => filter === 'all' || item.type === filter);
  return <div className="inner-page"><SiteNav current="gallery" /><main><section className="inner-intro experience-shell"><SectionTop number="01" label="GALLERY" aside="WATCH / VIEW / EXPLORE" /><h1 data-reveal>THE<br />GALLERY<span>.</span></h1><p data-reveal>Moving images and still frames in one place. More pieces will enter this archive as the collection grows.</p></section><section className="gallery-content experience-shell"><div className="gallery-controls"><span>{String(items.length).padStart(2, '0')} PIECES</span><div role="group" aria-label="Gallery filter">{[['all','ALL'],['video','FILM'],['photo','PHOTO']].map(([value,label])=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{label}</button>)}</div></div><div className="gallery-grid">{items.map((item, index)=><article className="gallery-piece" key={item.id} data-reveal><div className="gallery-piece-media">{item.type==='video'?<ReelVideo item={item} controls />:<button type="button" onClick={()=>setPhoto(item)} aria-label={`Open ${item.title}`}><img src={item.src} alt={item.title} loading="lazy" /><span>EXPAND ↗</span></button>}</div><div className="gallery-piece-caption"><span>{String(index+1).padStart(2,'0')} / {item.type.toUpperCase()}</span><h2>{item.title}</h2></div></article>)}</div>{allMedia.length <= 2 && <p className="gallery-note">Only the current reel and its poster are shown. Your real videos and photos can be added without changing the layout.</p>}</section></main><SiteFooter />{photo&&<div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={photo.title} onMouseDown={(event)=>{if(event.target===event.currentTarget)setPhoto(null)}}><button type="button" onClick={()=>setPhoto(null)} aria-label="Close photo">CLOSE ×</button><img src={photo.src} alt={photo.title}/></div>}</div>;
}

function AboutPage() {
  usePageMotion('about');
  return <div className="inner-page about-page"><SiteNav current="about" /><main><section className="inner-intro experience-shell"><SectionTop number="01" label="ABOUT" aside="THE PERSON BEHIND THE FRAME" /><h1 data-reveal>WHO I AM<span>.</span></h1><p data-reveal>I'm Aashish Mahato, a 20-year-old multidisciplinary creative working across film, photography, design, and digital experiences.</p></section><section className="about-statement experience-shell"><div data-reveal><span>WHY WORK WITH ME</span><h2>ONE IDEA.<br /><em>NO SINGLE</em><br />FORMAT.</h2></div><div data-reveal><p>The strongest idea may need more than one medium. I can see it as a frame, shape it in motion, and carry its visual language into digital space.</p><p>I stay with the details and keep refining until the result meets the client's expectations and my own standards.</p></div></section><section className="about-capabilities experience-shell"><SectionTop number="02" label="CAPABILITIES" aside="HOW I MAKE THINGS" /><div>{[['01','IMAGE','Photography · Videography'],['02','MOTION','Editing · Motion graphics'],['03','DESIGN','Identity · Graphic design'],['04','DIGITAL','Web · Apps · Creative technology']].map(([number,title,detail])=><div className="capability-line" key={number} data-reveal><span>{number}</span><h3>{title}</h3><p>{detail}</p></div>)}</div></section></main><SiteFooter /></div>;
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
        document.title = titles[next];
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
      if (url.origin !== window.location.origin || !['/','/work/','/gallery/','/about/'].includes(url.pathname) || routeFor(url.pathname) === current.current) return;
      event.preventDefault();
      moveTo(url, true);
    };
    const onPop = () => moveTo(new URL(window.location.href), false);
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPop);
    return () => { document.removeEventListener('click', onClick); window.removeEventListener('popstate', onPop); };
  }, []);

  const Page = { home: Home, work: WorkPage, gallery: GalleryPage, about: AboutPage }[route];
  return <><div key={route}><Page /></div><div className="experience-transition" ref={overlay} aria-hidden="true"><span>A/M<small>®</small></span><i /><p>IMAGE · MOTION · DESIGN · CODE</p></div></>;
}
