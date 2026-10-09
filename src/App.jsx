import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { heroReel } from './portfolio-data.js';
import { SiteHeader } from './SiteChrome.jsx';

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
    const sync = () => {
      if (inView && !document.hidden && !preference.matches) video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    observer.observe(heroRef.current);
    document.addEventListener('visibilitychange', sync);
    preference.addEventListener('change', sync);
    return () => { observer.disconnect(); video.pause(); document.removeEventListener('visibilitychange', sync); preference.removeEventListener('change', sync); };
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

          if (window.matchMedia('(max-width: 640px)').matches) {
            gsap.from([...first, ...second], {
              autoAlpha: 0, yPercent: 55, duration: .48, stagger: .025,
              ease: 'power3.out', clearProps: 'opacity,visibility,transform',
            });
            gsap.from(period, {
              autoAlpha: 0, scale: 0, duration: .35, delay: .3,
              ease: 'back.out(2)', clearProps: 'opacity,visibility,transform',
            });
          } else {
            gsap.timeline({ defaults: { ease: 'power4.out' } })
              .from(first, {
                autoAlpha: 0, yPercent: 130, rotationX: -70, transformOrigin: '50% 100%',
                stagger: .045, duration: 1.15, force3D: true,
                clearProps: 'opacity,visibility,transform',
              }, 0)
              .from(second, {
                autoAlpha: 0, yPercent: 130, rotationX: -70, transformOrigin: '50% 100%',
                stagger: .045, duration: 1.15, force3D: true,
                clearProps: 'opacity,visibility,transform',
              }, .27)
              .from(period, {
                autoAlpha: 0, scale: 0, rotation: -75, transformOrigin: '50% 75%',
                duration: .65, ease: 'back.out(2.2)',
                clearProps: 'opacity,visibility,transform',
              }, .85);
          }
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
      <video ref={videoRef} className={`hero-video ${videoReady ? 'is-ready' : ''}`} muted loop playsInline preload="metadata" poster={heroReel.poster} aria-hidden="true" onCanPlay={() => setVideoReady(true)} onError={() => setVideoReady(false)}>
        <source src={heroReel.mobileSrc} media="(max-width: 700px)" type="video/mp4" />
        <source src={heroReel.src} type="video/mp4" />
      </video>
      <div className="hero-shade" aria-hidden="true" />
      <SiteHeader current="home" />
      <div className="hero-content">
        <span className="hero-reveal-accent" aria-hidden="true" />
        <span className="hero-kicker">AASHISH MAHATO <span>—</span> FILM / PHOTOGRAPHY / DESIGN / WEB</span>
        <h1 id="hero-title" aria-label="Aashish Mahato"><span className="hero-name-line" aria-hidden="true"><HeroLetters text="AASHISH" /></span>{' '}<span className="hero-name-line" aria-hidden="true"><HeroLetters text="MAHATO." /></span></h1>
        <p><span>FILM</span> <i>•</i> <span>PHOTOGRAPHY</span> <i>•</i> <span>DESIGN</span> <i>•</i> <span>WEB</span></p>
      </div>
      <a className="hero-scroll" href="#home-gallery"><span>SCROLL TO EXPLORE</span><span aria-hidden="true">↘</span></a>
      <span className="hero-edition">PORTFOLIO / 2026</span>
    </section>
  );
}

export default function App() {
  return <Hero />;
}
