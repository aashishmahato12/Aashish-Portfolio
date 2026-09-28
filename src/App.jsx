import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { animate, stagger } from 'animejs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs.jsx';
import CompanyMarquee from './CompanyMarquee.jsx';
import { collaborators, heroReel } from './portfolio-data.js';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  { id: '01', title: 'Kinetic Frames', type: 'Film & Motion', category: 'film', className: 'card-kinetic', line: 'Rhythm, light, and movement.' },
  { id: '02', title: 'Light Study', type: 'Photography', category: 'film', className: 'card-light', line: 'A study of shape and shadow.' },
  { id: '03', title: 'Atlas Studio', type: 'Web Experience', category: 'digital', className: 'card-atlas', line: 'A digital home for bold ideas.' },
  { id: '04', title: 'Forma Objects', type: 'Brand Identity', category: 'design', className: 'card-forma', line: 'Objects with a point of view.' },
  { id: '05', title: 'Pulse', type: 'App Design', category: 'digital', className: 'card-pulse', line: 'A clearer view of your day.' },
  { id: '06', title: 'Sora', type: 'Visual Identity', category: 'design', className: 'card-sora', line: 'Room to slow down.' },
];

const filters = [
  { key: 'all', label: 'All work' },
  { key: 'film', label: 'Film & photo' },
  { key: 'design', label: 'Design' },
  { key: 'digital', label: 'Digital' },
];

const services = [
  'Photography', 'Videography', 'Video editing', 'Motion graphics',
  'Graphic design', 'Branding', 'Web design', 'Web development',
  'Apps', 'Creative technology',
];

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '↘'}</span>;
}

function HeroLetters({ text }) {
  return [...text].map((letter, index) => (
    <span className={`hero-letter ${letter === '.' ? 'hero-period' : ''}`} key={`${letter}-${index}`}>{letter}</span>
  ));
}

function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onEscape = (event) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [open]);

  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Aashish Mahato, back to top">A/M<span>®</span></a>
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="#work">Work</a>
        <a href="./projects/">Projects</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      <button className={`menu-button ${open ? 'is-open' : ''}`} type="button" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
        <span /><span />
      </button>
      <nav className={`mobile-nav ${open ? 'is-open' : ''}`} id="mobile-nav" aria-label="Mobile navigation" aria-hidden={!open}>
        <a href="#work" onClick={() => setOpen(false)}>Work</a>
        <a href="./projects/" onClick={() => setOpen(false)}>Projects</a>
        <a href="#about" onClick={() => setOpen(false)}>About</a>
        <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
      </nav>
    </header>
  );
}

function Hero() {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setVideoReady(false));
  }, []);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const lines = hero.querySelectorAll('.hero-name-line');
        const first = lines[0].querySelectorAll('.hero-letter');
        const second = lines[1].querySelectorAll('.hero-letter:not(.hero-period)');
        const period = lines[1].querySelector('.hero-period');
        const intro = hero.querySelector('.site-intro');
        const timeline = gsap.timeline({ defaults: { ease: 'power4.out' } });

        gsap.set(intro, { display: 'grid', yPercent: 0 });
        timeline
          .from('.site-intro-mark', { autoAlpha: 0, y: 24, duration: .55 }, 0)
          .from('.site-intro-rule', { scaleX: 0, transformOrigin: 'left center', duration: .65 }, .08)
          .from('.site-intro-caption', { autoAlpha: 0, y: 10, duration: .55 }, .18)
          .to(intro, {
            yPercent: -101, duration: .8, ease: 'power4.inOut',
            onComplete: () => { intro.style.display = 'none'; },
          }, .55)
          .from('.hero-kicker', { autoAlpha: 0, y: 20, duration: .8, clearProps: 'opacity,visibility,transform' }, .95)
          .from(first, {
            autoAlpha: 0, yPercent: 130, rotationX: -70, transformOrigin: '50% 100%',
            stagger: .045, duration: 1.15, force3D: true,
            clearProps: 'opacity,visibility,transform',
          }, 1.05)
          .from(second, {
            autoAlpha: 0, yPercent: 130, rotationX: -70, transformOrigin: '50% 100%',
            stagger: .045, duration: 1.15, force3D: true,
            clearProps: 'opacity,visibility,transform',
          }, 1.32)
          .from(period, {
            autoAlpha: 0, scale: 0, rotation: -75, transformOrigin: '50% 75%',
            duration: .65, ease: 'back.out(2.2)',
            clearProps: 'opacity,visibility,transform',
          }, 1.9)
          .from('.hero-content p > span, .hero-content p > i', {
            autoAlpha: 0, y: 18, stagger: .075, duration: .75,
            clearProps: 'opacity,visibility,transform',
          }, 1.78)
          .from('.hero-scroll, .hero-edition', {
            autoAlpha: 0, y: 14, stagger: .1, duration: .7,
            clearProps: 'opacity,visibility,transform',
          }, 2.02);

        gsap.to('.hero h1', {
          scale: 1.16,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: .8,
          },
        });
      }, hero);

      return () => context.revert();
    });

    return () => motion.revert();
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let heroHeight = hero.offsetHeight;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reducedMotion.matches) return;

      const progress = Math.min(1, Math.max(0, window.scrollY / heroHeight));
      hero.style.setProperty('--hero-bg-shift', `${Math.round(progress * Math.min(heroHeight * 0.045, 48))}px`);
      hero.style.setProperty('--hero-text-shift', `${Math.round(progress * -Math.min(heroHeight * 0.19, 140))}px`);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onResize = () => {
      heroHeight = hero.offsetHeight;
      requestUpdate();
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', onResize);
    reducedMotion.addEventListener('change', requestUpdate);
    requestUpdate();

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', onResize);
      reducedMotion.removeEventListener('change', requestUpdate);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={heroRef} className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-fallback" aria-hidden="true"><div className="fallback-light" /></div>
      <video ref={videoRef} className={`hero-video ${videoReady ? 'is-ready' : ''}`} autoPlay muted loop playsInline preload="metadata" poster={heroReel.poster} src={heroReel.src} aria-hidden="true" onCanPlay={() => setVideoReady(true)} onError={() => setVideoReady(false)} />
      <div className="hero-shade" aria-hidden="true" />
      <div className="site-intro" aria-hidden="true"><span className="site-intro-mark">A/M<span>®</span></span><span className="site-intro-rule" /><span className="site-intro-caption">CREATIVE PORTFOLIO / 2026</span></div>
      <Header />
      <div className="hero-content">
        <span className="hero-kicker">AASHISH MAHATO <span>—</span> MULTIDISCIPLINARY CREATIVE</span>
        <h1 id="hero-title" aria-label="Aashish Mahato"><span className="hero-name-line" aria-hidden="true"><HeroLetters text="AASHISH" /></span><span className="hero-name-line" aria-hidden="true"><HeroLetters text="MAHATO." /></span></h1>
        <p><span>IMAGE</span> <i>•</i> <span>MOTION</span> <i>•</i> <span>DESIGN</span> <i>•</i> <span>CODE</span></p>
      </div>
      <a className="hero-scroll" href="#work"><span>SCROLL TO EXPLORE</span><Arrow /></a>
      <span className="hero-edition">PORTFOLIO / 2026</span>
    </section>
  );
}

function Work() {
  const [filter, setFilter] = useState('all');
  const stageRef = useRef(null);
  const gridRef = useRef(null);
  const shown = filter === 'all' ? projects : projects.filter((project) => project.category === filter);

  useLayoutEffect(() => {
    const motion = gsap.matchMedia();
    motion.add({
      wide: '(min-width: 1001px) and (min-height: 650px)',
      narrow: '(max-width: 1000px), (max-height: 649px)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, ({ conditions }) => {
      if (conditions.reduce) return;

      const stage = stageRef.current;
      const track = gridRef.current;
      if (!stage || !track) return;
      if (conditions.wide) stage.classList.add('is-horizontal');

      const context = gsap.context(() => {
        const cards = [...track.querySelectorAll('.project')];
        let horizontal;

        if (conditions.wide) {
          const shift = () => Math.max(0, track.scrollWidth - stage.clientWidth);
          const fill = stage.querySelector('.gallery-progress-fill');
          const count = stage.querySelector('.gallery-progress-count');
          fill.style.transform = 'scaleX(0)';
          count.textContent = `01 / ${String(cards.length).padStart(2, '0')}`;

          horizontal = gsap.to(track, {
            x: () => -shift(),
            ease: 'none',
            scrollTrigger: {
              trigger: stage,
              start: 'top 10%',
              end: () => `+=${Math.max(1, shift())}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: ({ progress }) => {
                fill.style.transform = `scaleX(${progress})`;
                count.textContent = `${String(Math.min(cards.length, Math.floor(progress * cards.length) + 1)).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
              },
            },
          });
        }

        cards.forEach((card) => {
          const image = card.querySelector('.project-image');
          const info = card.querySelector('.project-info');
          const revealTrigger = conditions.wide
            ? { trigger: card, containerAnimation: horizontal, start: 'left 85%', once: true }
            : { trigger: card, start: 'top 82%', once: true };

          gsap.timeline({ scrollTrigger: revealTrigger })
            .fromTo(image,
              { clipPath: 'inset(0 0 100% 0)', y: 28 },
              { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1, ease: 'power3.out', clearProps: 'clipPath,transform' })
            .fromTo(info,
              { autoAlpha: 0, y: 18 },
              { autoAlpha: 1, y: 0, duration: .65, ease: 'power3.out', clearProps: 'opacity,visibility,transform' }, '-=.45');

          gsap.fromTo(card.querySelector('.project-art-title'),
            { yPercent: 9 },
            {
              yPercent: -9,
              ease: 'none',
              scrollTrigger: conditions.wide
                ? { trigger: card, containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: 1 }
                : { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1 },
            });
        });
      }, stage);
      const refresh = window.requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        window.cancelAnimationFrame(refresh);
        context.revert();
        stage.classList.remove('is-horizontal');
      };
    });

    return () => motion.revert();
  }, [filter]);

  return (
    <section className="work section-wrap" id="work" aria-labelledby="work-title">
      <div className="section-index"><span>01 / SELECTED WORK</span><span>IMAGE · IDENTITY · INTERACTION</span></div>
      <div className="section-intro">
        <div className="work-heading"><span className="small-label">AN OPEN CANVAS</span><h2 id="work-title"><span className="heading-line"><span>A collection of</span></span><span className="heading-line"><span><em>possibilities.</em></span></span></h2></div>
        <div className="work-intro-copy"><span className="work-count">{String(projects.length).padStart(2, '0')} / CONCEPT STUDIES</span><p>Concepts across moving image, visual identity, and digital spaces. These are placeholders until my real projects are added.</p></div>
      </div>
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList variant="line" className="filters" aria-label="Filter projects">
          {filters.map((item) => <TabsTrigger key={item.key} value={item.key}>{item.label}</TabsTrigger>)}
        </TabsList>
        <div className="project-stage" ref={stageRef}>
          <TabsContent value={filter} className="project-grid" ref={gridRef}>
            {shown.map((project) => (
              <article className="project" key={project.id}>
                <div className={`project-image ${project.className}`}>
                  <span className="project-corner">CONCEPT / {project.id}</span>
                  <span className="project-art-title">{project.title}</span>
                  <span className="project-art-line">{project.line}</span>
                </div>
                <div className="project-info"><div><span>{project.id} / {project.type}</span><h3>{project.title}</h3></div><span className="project-arrow" aria-hidden="true">↗</span></div>
              </article>
            ))}
          </TabsContent>
          <div className="gallery-progress" aria-hidden="true"><span>SCROLL TO EXPLORE</span><span className="gallery-progress-track"><span className="gallery-progress-fill" /></span><span className="gallery-progress-count">01 / {String(shown.length).padStart(2, '0')}</span></div>
        </div>
      </Tabs>
      <a className="work-full-link" href="./projects/">Explore projects, video & photo gallery <Arrow diagonal /></a>
    </section>
  );
}

function MotionStatement() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const motion = gsap.matchMedia();
    motion.add({
      wide: '(min-width: 721px)',
      narrow: '(max-width: 720px)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, ({ conditions }) => {
      if (conditions.reduce) return;

      const section = sectionRef.current;
      const context = gsap.context(() => {
        if (conditions.wide) {
          gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: '+=130%',
              pin: true,
              scrub: 1,
              anticipatePin: 1,
            },
          })
            .fromTo('.motion-line:first-child > span', { xPercent: -65 }, { xPercent: 0, ease: 'none' }, 0)
            .fromTo('.motion-line:last-child > span', { xPercent: 65 }, { xPercent: 0, ease: 'none' }, 0)
            .fromTo('.motion-ring', { scale: .45, rotation: -90, opacity: .15 }, { scale: 1.1, rotation: 0, opacity: .7, ease: 'none' }, 0)
            .to(section, { backgroundColor: '#d4b18a', color: '#151b17', ease: 'none' }, .5)
            .to('.motion-line:last-child', { color: '#151b17', ease: 'none' }, .5)
            .fromTo('.motion-caption', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, ease: 'none' }, .55)
            .to('.motion-title', { scale: 1.12, autoAlpha: .25, ease: 'none' }, .83);
        } else {
          gsap.from('.motion-line > span', {
            xPercent: (index) => index ? 35 : -35,
            autoAlpha: 0,
            duration: 1,
            stagger: .12,
            ease: 'power3.out',
            scrollTrigger: { trigger: section, start: 'top 80%', once: true },
          });
        }
      }, section);
      const refresh = window.requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        window.cancelAnimationFrame(refresh);
        context.revert();
      };
    });

    return () => motion.revert();
  }, []);

  return (
    <section className="motion-statement" ref={sectionRef} aria-labelledby="motion-title">
      <div className="motion-ring" aria-hidden="true" />
      <div className="motion-topline"><span>AASHISH MAHATO</span><span>CREATIVE PRACTICE / 2026</span></div>
      <h2 className="motion-title" id="motion-title"><span className="motion-line"><span>IDEAS</span></span><span className="motion-line"><span>IN MOTION.</span></span></h2>
      <p className="motion-caption">IMAGE <span>•</span> MOTION <span>•</span> DESIGN <span>•</span> CODE</p>
      <span className="motion-bottom">SCROLL TO CONTINUE ↘</span>
    </section>
  );
}

function About() {
  return (
    <section className="about section-wrap" id="about" aria-labelledby="about-title">
      <div className="section-index"><span>02 / ABOUT</span><span>ONE MIND, MANY MEDIUMS</span></div>
      <div className="about-grid">
        <div><p className="small-label">A LITTLE ABOUT ME</p><h2 id="about-title"><span className="heading-line"><span>I create across</span></span><span className="heading-line"><span><em>the spectrum.</em></span></span></h2></div>
        <div className="about-copy"><p>I'm Aashish Mahato. My work moves between photography, film, motion, design, and technology. I follow the idea to the medium that tells it best.</p><p>From a single frame to a complete digital experience, I care about how the details feel and what the work leaves behind.</p><a className="underlined-link" href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer">Explore my GitHub <Arrow diagonal /></a></div>
      </div>
      <div className="services"><span className="small-label">WHAT I DO</span><div>{services.map((service, index) => <span key={service}><b>{String(index + 1).padStart(2, '0')}</b>{service}</span>)}</div></div>
    </section>
  );
}

function WorkedWith() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.from('.worked-number', {
          textContent: 0,
          snap: { textContent: 1 },
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        });
      }, sectionRef);
      return () => context.revert();
    });
    return () => motion.revert();
  }, []);

  return (
    <section className="worked-with" ref={sectionRef} id="worked-with" aria-labelledby="worked-title">
      <div className="worked-inner section-wrap">
        <div className="section-index"><span>03 / COLLABORATIONS</span><span>PEOPLE MAKE THE WORK</span></div>
        <div className="worked-heading"><div><span className="small-label">THE COMPANY I KEEP</span><h2 id="worked-title">WORKED<br /><em>WITH.</em></h2></div><p>{collaborators.length ? 'Across different teams, ideas, and creative challenges. A few of the people and places behind the work.' : 'Across different teams, ideas, and creative challenges. Real company names and logos will be added here soon.'}</p></div>
        <div className="worked-stats"><div><strong><span className="worked-number">10</span><i>+</i></strong><span>COMPANIES WORKED WITH</span></div><div><strong>20</strong><span>YEARS OLD · JUST GETTING STARTED</span></div><div><strong>01</strong><span>SHOWREEL TO EXPLORE</span></div></div>
        <div className="worked-meta"><span>{collaborators.length ? 'COLLABORATOR MARKS' : 'COMPANY LOGO PLACEHOLDERS'}</span><a href="./projects/#companies">See all collaborations ↗</a></div>
      </div>
      <CompanyMarquee dark />
    </section>
  );
}

function Contact() {
  const linkRef = useRef(null);

  useEffect(() => {
    const motion = gsap.matchMedia();
    motion.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const link = linkRef.current;
      const arrow = link.querySelector('span');
      const moveX = gsap.quickTo(link, 'x', { duration: .45, ease: 'power3.out' });
      const moveY = gsap.quickTo(link, 'y', { duration: .45, ease: 'power3.out' });
      let centerX = 0;
      let centerY = 0;

      const enter = () => {
        const bounds = link.getBoundingClientRect();
        centerX = bounds.left + bounds.width / 2;
        centerY = bounds.top + bounds.height / 2;
        gsap.to(arrow, { rotation: 45, duration: .35, ease: 'power2.out' });
      };
      const move = (event) => {
        moveX((event.clientX - centerX) * .13);
        moveY((event.clientY - centerY) * .13);
      };
      const leave = () => {
        moveX(0);
        moveY(0);
        gsap.to(arrow, { rotation: 0, duration: .35, ease: 'power2.out' });
      };

      link.addEventListener('pointerenter', enter);
      link.addEventListener('pointermove', move);
      link.addEventListener('pointerleave', leave);

      return () => {
        link.removeEventListener('pointerenter', enter);
        link.removeEventListener('pointermove', move);
        link.removeEventListener('pointerleave', leave);
        gsap.killTweensOf([link, arrow]);
        gsap.set([link, arrow], { clearProps: 'transform' });
      };
    });

    return () => motion.revert();
  }, []);

  return (
    <section className="contact section-wrap" id="contact" aria-labelledby="contact-title">
      <div className="section-index"><span>04 / CONTACT</span><span>THE NEXT IDEA STARTS HERE</span></div>
      <div className="contact-main"><p>HAVE SOMETHING IN MIND?</p><h2 id="contact-title"><span className="heading-line"><span>LET'S MAKE</span></span><span className="heading-line"><span><em>IT REAL.</em></span></span></h2><a ref={linkRef} href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer">FIND ME ON GITHUB <Arrow diagonal /></a></div>
      <footer><span>© {new Date().getFullYear()} AASHISH MAHATO</span><a href="#top">BACK TO TOP ↑</a></footer>
    </section>
  );
}

export default function App() {
  const mainRef = useRef(null);

  useEffect(() => {
    const scrolling = new Lenis({
      autoRaf: true,
      anchors: true,
      smoothWheel: true,
      stopInertiaOnNavigate: true,
      duration: 1.1,
    });
    const unsubscribe = scrolling.on('scroll', ScrollTrigger.update);

    return () => {
      unsubscribe();
      scrolling.destroy();
    };
  }, []);

  useEffect(() => {
    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray('.section-index').forEach((index) => {
          gsap.from(index, {
            autoAlpha: 0,
            y: 12,
            duration: .65,
            ease: 'power2.out',
            clearProps: 'opacity,visibility,transform',
            scrollTrigger: { trigger: index, start: 'top 92%', once: true },
          });
        });

        gsap.utils.toArray('.section-intro, .about-grid, .contact-main').forEach((section) => {
          const lines = section.querySelectorAll('.heading-line > span');
          const label = section.querySelector('.small-label, :scope > p');
          const copy = section.querySelector('.work-intro-copy, .about-copy, :scope > a');
          const timeline = gsap.timeline({
            scrollTrigger: { trigger: section, start: 'top 78%', once: true },
          });

          if (label) timeline.from(label, {
            autoAlpha: 0, y: 12, duration: .55, ease: 'power2.out',
            clearProps: 'opacity,visibility,transform',
          });
          timeline.from(lines, {
            yPercent: 110, duration: 1.05, stagger: .13, ease: 'power4.out',
            clearProps: 'transform',
          }, label ? '-=.25' : 0);
          if (copy) timeline.from(copy, {
            autoAlpha: 0, y: 26, duration: .8, ease: 'power3.out',
            clearProps: 'opacity,visibility,transform',
          }, '-=.65');
        });
      }, mainRef);

      return () => context.revert();
    });

    return () => motion.revert();
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    const sections = document.querySelectorAll('main .services');
    const animations = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const targets = [...entry.target.querySelectorAll(':scope > .small-label, :scope > div > span')];
        const animation = animate(targets, {
          clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
          y: [18, 0],
          duration: 820,
          delay: stagger(80),
          ease: 'outExpo',
          onComplete: () => {
            entry.target.classList.remove('will-reveal');
            targets.forEach((target) => {
              target.style.removeProperty('clip-path');
              target.style.removeProperty('transform');
            });
            animations.delete(animation);
          },
        });
        animations.add(animation);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    sections.forEach((section) => {
      section.classList.add('will-reveal');
      observer.observe(section);
    });

    const stopForReducedMotion = () => {
      if (!reducedMotion.matches) return;
      observer.disconnect();
      animations.forEach((animation) => animation.revert());
      animations.clear();
      sections.forEach((section) => section.classList.remove('will-reveal'));
    };
    reducedMotion.addEventListener('change', stopForReducedMotion);

    return () => {
      reducedMotion.removeEventListener('change', stopForReducedMotion);
      observer.disconnect();
      animations.forEach((animation) => animation.revert());
      sections.forEach((section) => section.classList.remove('will-reveal'));
    };
  }, []);

  return <><a className="skip-link" href="#work">Skip to work</a><Hero /><main ref={mainRef}><Work /><MotionStatement /><About /><WorkedWith /><Contact /></main></>;
}
