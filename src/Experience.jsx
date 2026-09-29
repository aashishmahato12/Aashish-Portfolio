import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, stagger } from 'animejs';
import App from './App.jsx';
import { Cursor, CursorFollow, CursorProvider } from './components/animate-ui/components/animate/cursor.jsx';
import { collaborators, featuredProjects, galleryMedia, heroReel } from './portfolio-data.js';

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

    <section className="home-about" aria-labelledby="home-about-title"><div className="experience-shell"><SectionTop number="02" label="THE PERSON" aside="A FEW WORDS BEFORE THE WORK" /><div className="home-about-grid"><div data-reveal><span className="experience-eyebrow">WHO I AM / WHY ME</span><h2 id="home-about-title">ONE IDEA.<br /><em>MANY WAYS</em><br />TO MAKE IT.</h2></div><div className="home-about-copy" data-reveal><span className="about-age">20 <small>YEARS OLD</small></span><p>I'm Aashish Mahato. I work across film, photography, design, and digital experiences. I follow an idea into the format that gives it the most life.</p><p>I keep refining a project until it meets the client's expectations and my own standards.</p><a className="experience-text-link" href="/about/">MORE ABOUT ME <span>↗</span></a></div></div></div></section>

    <section className="home-work" aria-labelledby="home-work-title"><div className="experience-shell"><SectionTop number="03" label="SELECTED WORK" aside="A SHORT PREVIEW" /><div className="home-work-heading" data-reveal><h2 id="home-work-title">A CLOSER<br /><em>LOOK.</em></h2><p>Each project deserves its own story. This is a glimpse before you explore the full work.</p></div><a href={featuredProjects[0] ? `/work/#${featuredProjects[0].id}` : '/work/'} className="home-feature" data-reveal><div className="home-feature-visual"><img src={featuredProjects[0]?.cover || heroReel.poster} alt={featuredProjects[0] ? `${featuredProjects[0].title} cover` : 'Current showreel cover'} loading="lazy" /><span>EXPLORE THE WORK ↗</span></div><div className="home-feature-info"><span>01 / {featuredProjects[0]?.category || 'FILM & MOTION'}</span><h3>{featuredProjects[0]?.title || 'THE SHOWREEL'}</h3><span>VIEW WORK ↗</span></div></a>{featuredProjects.length > 1 && <div className="home-project-list">{featuredProjects.slice(1,4).map((project,index)=><a href={`/work/#${project.id}`} key={project.id}><span>{String(index+2).padStart(2,'0')} / {project.category}</span><strong>{project.title}</strong><span>↗</span></a>)}</div>}{!featuredProjects.length && <p className="home-work-note">More project stories will appear here when the real work is added.</p>}<a className="experience-text-link" href="/work/">EXPLORE ALL WORK <span>↗</span></a></div></section>
    <HomeCollaborators />
    <SiteFooter />
  </main></>;
}

function ProjectStory({ project, index }) {
  const video = project.media?.find((item) => item.type === 'video');
  const photos = project.media?.filter((item) => item.type === 'photo') || [];
  return <article className="project-story" id={project.id} data-reveal><div className="project-story-heading"><span>{String(index + 1).padStart(2, '0')} / {project.category}</span><h2>{project.title}</h2><p>{project.description}</p></div><div className="project-story-main">{video ? <ReelVideo item={video} controls /> : <img src={project.cover} alt={`${project.title} cover`} loading="lazy" />}</div>{photos.length > 0 && <div className="project-story-gallery">{photos.filter((item) => item.src !== project.cover).map((item) => <figure key={item.src}><img src={item.src} alt={item.title} loading="lazy" /><figcaption>{item.title}</figcaption></figure>)}</div>}<div className="project-story-meta"><span>{project.company || 'INDEPENDENT PROJECT'}</span><span>{project.year || ''}</span></div></article>;
}

function WorkPage() {
  usePageMotion('work');
  return <div className="inner-page"><SiteNav current="work" /><main><section className="inner-intro experience-shell"><SectionTop number="01" label="WORK" aside="FILM · IMAGE · DESIGN · DIGITAL" /><h1 data-reveal>THE WORK<span>.</span></h1><p data-reveal>Films, visual identities, and designs made across mediums.</p></section><section className="work-feature experience-shell" aria-labelledby="work-feature-title"><div className="work-feature-heading" data-reveal><span>FEATURED / 001</span><h2 id="work-feature-title">CURRENT<br /><em>SHOWREEL.</em></h2></div><div className="work-feature-media" data-reveal><ReelVideo controls /></div><div className="work-feature-meta"><span>FILM & MOTION</span><p>A moving overview of my visual work. Play the complete reel above.</p><a href="/gallery/">OPEN GALLERY ↗</a></div></section><section className="project-stories experience-shell"><SectionTop number="02" label="PROJECT STORIES" aside={`${String(featuredProjects.length).padStart(2,'0')} PROJECTS`} />{featuredProjects.map((project,index)=><ProjectStory project={project} index={index} key={project.id}/>)}</section></main><SiteFooter /></div>;
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
