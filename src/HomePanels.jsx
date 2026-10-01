import { mediaAlt, mediaDescription } from './media-text.js';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { animate } from 'animejs';
import { galleryMedia } from './portfolio-data.js';
import './home-panels.css';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
const panels = galleryMedia.slice(0, 5);

function PanelVideo({ item, play }) {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (play && !document.hidden && !preference.matches) video.play().catch(() => {});
      else video.pause();
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    preference.addEventListener('change', sync);
    return () => { video.pause(); document.removeEventListener('visibilitychange', sync); preference.removeEventListener('change', sync); };
  }, [play]);
  return <video ref={ref} src={play ? (window.matchMedia('(max-width: 700px)').matches && item.mobileSrc ? item.mobileSrc : item.src) : undefined} poster={item.poster} muted loop playsInline preload="none" aria-label={item.title} title={mediaDescription(item)} />;
}

export default function HomePanels({ lenisRef }) {
  const rootRef = useRef(null);
  const navRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [stageVisible, setStageVisible] = useState(false);
  const activeRef = useRef(0);
  const scrollToRef = useRef(() => {});

  useLayoutEffect(() => {
    const root = rootRef.current;
    const cards = gsap.utils.toArray('.home-panel', root);
    const media = gsap.matchMedia();
    media.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const tween = gsap.to(cards, {
          xPercent: -100 * (cards.length - 1), ease: 'none',
          scrollTrigger: {
            trigger: root.querySelector('.home-panel-stage'), pin: true,
            start: 'top top', end: () => `+=${root.querySelector('.home-panel-track').scrollWidth - root.clientWidth}`,
            scrub: .8, anticipatePin: 1, invalidateOnRefresh: true,
            snap: { snapTo: 1 / (cards.length - 1), duration: { min: .14, max: .3 }, delay: .12, inertia: false },
            onUpdate: ({ progress }) => {
              const next = Math.round(progress * (cards.length - 1));
              if (next !== activeRef.current) { activeRef.current = next; setCurrent(next); }
            },
          },
        });
        scrollToRef.current = (index) => {
          const trigger = tween.scrollTrigger;
          const target = trigger.start + (index / (cards.length - 1)) * (trigger.end - trigger.start);
          if (lenisRef?.current) lenisRef.current.scrollTo(target, { duration: 1.1, force: true });
          else gsap.to(window, { scrollTo: target, duration: 1.1, ease: 'power3.inOut' });
        };
        cards.forEach((card) => {
          const visual = card.querySelector('.home-panel-media');
          gsap.fromTo(visual, { xPercent: -7 }, { xPercent: 7, ease: 'none', scrollTrigger: {
            trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true,
          } });
        });
      }, root);
      const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => { cancelAnimationFrame(refresh); context.revert(); scrollToRef.current = () => {}; };
    });
    media.add('(max-width: 700px), (prefers-reduced-motion: reduce)', () => {
      const row = root.querySelector('.home-panel-track');
      const sync = () => {
        const index = Math.round(row.scrollLeft / Math.max(1, row.clientWidth));
        if (index !== activeRef.current) { activeRef.current = index; setCurrent(index); }
      };
      row.addEventListener('scroll', sync, { passive: true });
      scrollToRef.current = (index) => row.scrollTo({ left: index * row.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      return () => { row.removeEventListener('scroll', sync); scrollToRef.current = () => {}; };
    });
    return () => media.revert();
  }, [lenisRef]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setStageVisible(entry.isIntersecting));
    observer.observe(rootRef.current.querySelector('.home-panel-stage'));
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const label = navRef.current?.querySelector('.home-panel-current');
    if (!label) return;
    const motion = animate(label, { opacity: [0, 1], translateY: [12, 0], duration: 400, ease: 'out(3)' });
    return () => motion.revert();
  }, [current]);

  return <section className="home-panels" ref={rootRef} id="home-gallery" aria-labelledby="home-gallery-title">
    <div className="experience-shell home-panels-intro"><div className="experience-section-top"><span>01 / THE MOVING IMAGE</span><span>A VISUAL FIRST LOOK</span></div><span className="home-panels-kicker">THE PORTFOLIO IN FRAMES</span><h2 id="home-gallery-title">THE WORK <em>MOVES.</em></h2><p>Film, photographs, and the ideas between them. Scroll through the work.</p></div>
    <div className="home-panel-stage">
      <div className="home-panel-track">{panels.map((item, index) => <article className="home-panel" id={`work-panel-${index + 1}`} key={item.id}>
        <div className="home-panel-media">{item.type === 'video' ? <PanelVideo item={item} play={stageVisible && current === index} /> : <img src={item.src} alt={mediaAlt(item)} loading="lazy" />}</div>
        <div className="home-panel-shade" />
        <div className="home-panel-content"><span>FRAME {String(index + 1).padStart(2, '0')} / {String(panels.length).padStart(2, '0')} · {item.category || item.type.toUpperCase()}</span><h3>{item.title}</h3><p>{item.type === 'video' ? 'A story in motion.' : 'A moment held in a frame.'}</p></div>
      </article>)}</div>
      <nav className="home-panel-nav" ref={navRef} aria-label="Portfolio frame navigation"><span className="home-panel-current">{String(current + 1).padStart(2, '0')} / {String(panels.length).padStart(2, '0')}</span><div><button type="button" aria-label="Previous frame" disabled={current === 0} onClick={() => scrollToRef.current(current - 1)}>←</button>{panels.map((item, index) => <a href={`#work-panel-${index + 1}`} key={item.id} className={current === index ? 'is-active' : ''} aria-label={`Go to ${item.title}`} aria-current={current === index ? 'step' : undefined} onClick={(event) => { event.preventDefault(); scrollToRef.current(index); }}><i /></a>)}<button type="button" aria-label="Next frame" disabled={current === panels.length - 1} onClick={() => scrollToRef.current(current + 1)}>→</button></div><span>SCROLL TO EXPLORE ↓</span></nav>
    </div>
    <div className="experience-shell home-panels-end"><a className="experience-text-link" href="/gallery/">ENTER THE FULL GALLERY <span>↗</span></a></div>
  </section>;
}
