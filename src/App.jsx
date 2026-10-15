import { loadVideoSource } from './video-sources.js';
import Video from './Video.jsx';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SiteHeader } from './SiteChrome.jsx';
import { Mouse } from 'lucide-react';
import { heroReel } from './portfolio-data.js';

gsap.registerPlugin(ScrollTrigger);

function HeroLetters({ text }) {
  return [...text].map((letter, index) => (
    <span className={`hero-letter ${letter === '.' ? 'hero-period' : ''}`} key={`${letter}-${index}`}>{letter}</span>
  ));
}

function Hero() {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    let readyToLoad = false;
    const sync = () => {
      if (readyToLoad && inView && !document.hidden && !preference.matches) {
        if (!video.getAttribute('src')) { loadVideoSource(video, heroReel.src); }
        video.play().catch(() => {});
      }
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    observer.observe(heroRef.current);
    const timer = setTimeout(() => { readyToLoad = true; sync(); }, 1200);
    document.addEventListener('visibilitychange', sync);
    preference.addEventListener('change', sync);
    return () => { clearTimeout(timer); observer.disconnect(); video.pause(); document.removeEventListener('visibilitychange', sync); preference.removeEventListener('change', sync); };
  }, []);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const lines = hero.querySelectorAll('.hero-name-line');
        if (window.location.hash !== '#my-work') {
          const first = lines[0].querySelectorAll('.hero-letter');
          const second = lines[1].querySelectorAll('.hero-letter:not(.hero-period)');
          const period = lines[1].querySelector('.hero-period');
          const accent = hero.querySelector('.hero-reveal-accent');
          gsap.timeline()
            .fromTo(accent, { scaleX: 0 }, { scaleX: 1, duration: .65, ease: 'power3.out' })
            .to(accent, { opacity: 0, duration: .35, delay: .25 });

          // Keep the name visible from the first paint; animate only its position.
          gsap.from([...first, ...second], {
            yPercent: 10, duration: .35, stagger: .012,
            ease: 'power3.out', clearProps: 'transform',
          });
          gsap.from(period, { scale: .9, duration: .3, clearProps: 'transform' });
        }

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
      if (reducedMotion.matches || window.scrollY > heroHeight) return;

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
      <Video ref={videoRef} className={`hero-video ${videoReady ? 'is-ready' : ''}`} muted loop playsInline preload="none" aria-hidden="true" onCanPlay={() => setVideoReady(true)} onError={() => setVideoReady(false)}>
      </Video>
      <div className="hero-shade" aria-hidden="true" />
      <SiteHeader current="home" />
      <div className="hero-content">
        <span className="hero-reveal-accent" aria-hidden="true" />
        <span className="hero-kicker">AASHISH MAHATO <span>—</span> FILM / PHOTOGRAPHY / DESIGN / WEB</span>
        <h1 id="hero-title" aria-label="Aashish Mahato"><span className="hero-name-line" aria-hidden="true"><HeroLetters text="AASHISH" /></span>{' '}<span className="hero-name-line" aria-hidden="true"><HeroLetters text="MAHATO." /></span></h1>
        <p><span>FILM</span> <i>•</i> <span>PHOTOGRAPHY</span> <i>•</i> <span>DESIGN</span> <i>•</i> <span>WEB</span></p>
      </div>
      <a className="hero-scroll" href="#home-gallery"><span>SCROLL TO EXPLORE</span><Mouse className="hero-scroll-icon" size={24} strokeWidth={1.5} aria-hidden="true" /></a>
      <span className="hero-edition">PORTFOLIO / 2026</span>
    </section>
  );
}

export default function App() {
  return <Hero />;
}
