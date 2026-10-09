import React, { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { galleryMedia, featuredProjects } from './portfolio-data.js';
import './parallax-chapters.css';

gsap.registerPlugin(ScrollTrigger);
const chapters = [
  { title: 'PLACES.', line: 'Travel films from Mustang and Manang.', image: featuredProjects[0].cover },
  { title: 'PEOPLE.', line: 'Portrait and street photography.', image: galleryMedia.find((item) => item.id === 'street-portrait').src },
  { title: 'DESIGN.', line: 'Brand identities and graphic design.', image: featuredProjects[3].cover },
];

function ChapterSlideshow({ images }) {
  const ref = useRef(null);
  const sources = [...new Set(images)];
  const sourceKey = sources.join('|');
  useEffect(() => {
    const root = ref.current;
    const [base, overlay] = root.children;
    const slides = sourceKey.split('|');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let disposed = false;
    let index = 0;
    let timer;
    let transition;
    let loading = false;
    const active = () => visible && !document.hidden && !reducedMotion.matches;
    const schedule = () => {
      clearTimeout(timer);
      if (active() && slides.length > 1 && !loading) timer = setTimeout(advance, 8000);
    };
    const advance = () => {
      loading = true;
      const nextIndex = (index + 1) % slides.length;
      const image = new Image();
      image.onload = () => {
        loading = false;
        if (disposed) return;
        if (!active()) { schedule(); return; }
        overlay.src = slides[nextIndex];
        transition = gsap.to(overlay, { opacity: 1, duration: 1.4, ease: 'sine.inOut', onComplete: () => {
          base.src = slides[nextIndex];
          index = nextIndex;
          root.dataset.slide = String(index + 1);
          gsap.set(overlay, { opacity: 0 });
          schedule();
        } });
      };
      image.onerror = () => { loading = false; if (!disposed) schedule(); };
      image.src = slides[nextIndex];
    };
    const sync = () => {
      if (!active()) clearTimeout(timer);
      else if (!transition?.isActive()) schedule();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.1 });
    observer.observe(root.closest('.parallax-chapter'));
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    return () => {
      disposed = true;
      clearTimeout(timer);
      transition?.kill();
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reducedMotion.removeEventListener('change', sync);
    };
  }, [sourceKey]);
  return <div className="parallax-chapter-slideshow" ref={ref} data-slide="1" aria-hidden="true">
    <img src={sources[0]} alt="" loading="lazy" />
    <img alt="" style={{ opacity: 0 }} />
  </div>;
}

export default function ParallaxChapters({ items = chapters, label = 'FILM / PHOTOGRAPHY / DESIGN', className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const videos = [...ref.current.querySelectorAll('video')];
    const visible = new Set();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => videos.forEach(video => {
      if (visible.has(video) && !document.hidden && !reducedMotion.matches) {
        if (!video.getAttribute('src')) {
          video.src = video.dataset.src;
          video.load();
        }
        video.play().catch(() => {});
      } else video.pause();
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target.querySelector('video');
        if (entry.isIntersecting) visible.add(video);
        else visible.delete(video);
      });
      sync();
    }, { threshold: 0.05 });
    videos.forEach(video => observer.observe(video.closest('.parallax-chapter')));
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reducedMotion.removeEventListener('change', sync);
      videos.forEach(video => video.pause());
    };
  }, [items]);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray('.parallax-chapter', ref.current).forEach((section) => {
          const image = section.querySelector('.parallax-chapter-image');
          const ratio = () => window.innerHeight / (window.innerHeight + section.offsetHeight);
          gsap.fromTo(image,
            { y: () => -window.innerHeight * ratio() * .45 },
            { y: () => window.innerHeight * (1 - ratio()) * .45,
              ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
          gsap.from(section.querySelectorAll('.parallax-chapter-content > *'), { autoAlpha: 0, y: 45, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 72%', once: true } });
        });
      }, ref);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  return <div className={`parallax-chapters ${className}`} ref={ref}>{items.map((chapter, index) => <section className="parallax-chapter" key={chapter.title} id={chapter.id} aria-label={chapter.title}>
    <div className="parallax-chapter-image" style={{ backgroundImage: `url(${chapter.video?.poster || chapter.image})` }}>
      {chapter.video && <video data-src={chapter.video.src} poster={chapter.video.poster || chapter.image} muted loop playsInline preload="none" aria-hidden="true" />}
      {!chapter.video && chapter.slides?.length > 1 && <ChapterSlideshow images={[chapter.image, ...chapter.slides]} />}
    </div>
    <div className="parallax-chapter-shade" />
    <div className="parallax-chapter-content"><span>{String(index + 1).padStart(2, '0')} / {label}</span><h2>{chapter.title}</h2><p>{chapter.line}</p>{chapter.href && <a className="parallax-chapter-link" href={chapter.href}>EXPLORE THE WORK ↗</a>}</div>
  </section>)}</div>;
}
