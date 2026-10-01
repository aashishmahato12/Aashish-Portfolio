import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { heroReel } from './portfolio-data.js';

gsap.registerPlugin(ScrollTrigger);

function HeroLetters({ text }) {
  return [...text].map((letter, index) => (
    <span className={`hero-letter ${letter === '.' ? 'hero-period' : ''}`} key={`${letter}-${index}`}>{letter}</span>
  ));
}

function Header() {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Aashish Mahato, back to top">A/M<span>®</span></a>
      <nav className="hero-nav" aria-label="Main navigation"><a href="/#my-work">My Work</a><a href="/gallery/">Gallery</a><a href="/about/">About</a></nav>
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
        if (window.location.hash === '#my-work') {
          gsap.set(intro, { display: 'none' });
          return;
        }
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
        <h1 id="hero-title" aria-label="Aashish Mahato"><span className="hero-name-line" aria-hidden="true"><HeroLetters text="AASHISH" /></span>{' '}<span className="hero-name-line" aria-hidden="true"><HeroLetters text="MAHATO." /></span></h1>
        <p><span>IMAGE</span> <i>•</i> <span>MOTION</span> <i>•</i> <span>DESIGN</span> <i>•</i> <span>CODE</span></p>
      </div>
      <a className="hero-scroll" href="#home-gallery"><span>SCROLL TO EXPLORE</span><span aria-hidden="true">↘</span></a>
      <span className="hero-edition">PORTFOLIO / 2026</span>
    </section>
  );
}

export default function App() {
  return <Hero />;
}
