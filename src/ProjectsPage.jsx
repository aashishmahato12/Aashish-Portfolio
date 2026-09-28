import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CompanyMarquee from './CompanyMarquee.jsx';
import { collaborators, featuredProjects, galleryMedia, heroReel, previewCompanies } from './portfolio-data.js';

gsap.registerPlugin(ScrollTrigger);

const projectPlaceholders = [
  { id: '01', title: 'YOUR NEXT\nFILM', category: 'FILM & MOTION', className: 'film' },
  { id: '02', title: 'YOUR NEXT\nIMAGE', category: 'PHOTOGRAPHY', className: 'photo' },
  { id: '03', title: 'YOUR NEXT\nIDEA', category: 'DESIGN & DIGITAL', className: 'digital' },
];

function ProjectCard({ project, index, placeholder }) {
  return (
    <article className={`portfolio-card ${placeholder ? `portfolio-card--${project.className}` : ''}`}>
      <div className="portfolio-card-visual">
        {project.cover ? <img src={project.cover} alt={`${project.title} cover`} loading="lazy" /> : <span className="portfolio-card-art" aria-hidden="true">{project.title}</span>}
        <span className="portfolio-card-stamp">{placeholder ? 'PROJECT PLACEHOLDER' : project.year || 'FEATURED PROJECT'}</span>
        <span className="portfolio-card-arrow" aria-hidden="true">↗</span>
      </div>
      <div className="portfolio-card-details"><span>{String(index + 1).padStart(2, '0')} / {project.category}</span><h3>{project.title.replace('\n', ' ')}</h3><p>{placeholder ? 'Your real project and its media will appear here.' : project.description || project.company || 'View project media below.'}</p></div>
    </article>
  );
}

function MediaTile({ item, onOpen }) {
  return (
    <article className={`media-tile media-tile--${item.type}`}>
      <div className="media-tile-frame">
        {item.type === 'video'
          ? <video controls playsInline preload="metadata" poster={item.poster} src={item.src} aria-label={item.title} />
          : <button type="button" onClick={() => onOpen(item)} aria-label={`Open ${item.title} photo`}><img src={item.src} alt={item.title} loading="lazy" /><span className="media-zoom" aria-hidden="true">↗</span></button>}
      </div>
      <div className="media-tile-caption"><span>{item.type.toUpperCase()} / {item.category || 'GALLERY'}</span><h3>{item.title}</h3></div>
    </article>
  );
}

export default function ProjectsPage() {
  const rootRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [openPhoto, setOpenPhoto] = useState(null);
  const projects = featuredProjects.length ? featuredProjects : projectPlaceholders;
  const gallery = [
    ...galleryMedia,
    ...featuredProjects.flatMap((project) => (project.media || []).map((item, index) => ({ ...item, id: `${project.id}-${index}`, title: item.title || project.title, category: project.category }))),
  ];
  const shown = filter === 'all' ? gallery : gallery.filter((item) => item.type === filter);
  const companies = collaborators.length ? collaborators : previewCompanies;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const lenis = new Lenis({ duration: 1.25, smoothWheel: true });
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const update = () => ScrollTrigger.update();
    lenis.on('scroll', update);
    return () => {
      lenis.off('scroll', update);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  useLayoutEffect(() => {
    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('.projects-hero-kicker', { y: 18, autoAlpha: 0, duration: .6 })
          .from('.projects-hero-title span', { yPercent: 115, autoAlpha: 0, stagger: .13, duration: 1.1 }, '-=.2')
          .from('.projects-hero-bottom', { y: 24, autoAlpha: 0, duration: .75 }, '-=.45');
        gsap.utils.toArray('.portfolio-card, .media-tile, .company-directory-item').forEach((item) => {
          gsap.from(item, { y: 55, autoAlpha: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%', once: true } });
        });
      }, rootRef);
      return () => context.revert();
    });
    return () => motion.revert();
  }, []);

  useEffect(() => {
    if (!openPhoto) return;
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpenPhoto(null); };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [openPhoto]);

  return (
    <div className="projects-page" ref={rootRef}>
      <a className="projects-skip" href="#featured">Skip to projects</a>
      <header className="projects-nav"><a className="projects-wordmark" href="../" aria-label="Aashish Mahato home">A/M<span>®</span></a><nav aria-label="Projects navigation"><a href="#featured">Projects</a><a href="#gallery">Gallery</a><a href="#companies">Worked with</a></nav><a className="projects-back" href="../">Back to home ↗</a></header>
      <main>
        <section className="projects-hero" aria-labelledby="projects-title">
          <div className="projects-hero-art" aria-hidden="true"><video autoPlay muted loop playsInline preload="metadata" poster={heroReel.poster} src={heroReel.src} /></div>
          <div className="projects-hero-shade" aria-hidden="true" />
          <div className="projects-hero-content"><p className="projects-hero-kicker">AASHISH MAHATO / SELECTED PRACTICE</p><h1 id="projects-title" className="projects-hero-title"><span>THE WORK.</span><span className="projects-hero-outline">THE PEOPLE.</span></h1><div className="projects-hero-bottom"><p>Moving image, stills, design, and the collaborations behind them.</p><a href="#featured">EXPLORE THE PROJECTS <span aria-hidden="true">↘</span></a></div></div>
          <span className="projects-hero-side">PORTFOLIO / 2026</span>
        </section>

        <section className="projects-featured projects-section" id="featured" aria-labelledby="featured-title"><div className="projects-section-top"><span>01 / FEATURED PROJECTS</span><span>{featuredProjects.length ? `${String(featuredProjects.length).padStart(2, '0')} PROJECTS` : 'PROJECTS COMING SOON'}</span></div><div className="projects-section-heading"><h2 id="featured-title">SELECTED<br /><em>PROJECTS.</em></h2><p>{featuredProjects.length ? 'A selection of work across image, motion, design, and digital.' : 'This space is ready for your best work. Project cards below are placeholders until you add the real pieces.'}</p></div><div className="portfolio-grid">{projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} placeholder={!featuredProjects.length} />)}</div></section>

        <section className="projects-gallery projects-section" id="gallery" aria-labelledby="gallery-title"><div className="projects-section-top"><span>02 / WATCH & VIEW</span><span>VIDEO + PHOTO</span></div><div className="projects-section-heading"><h2 id="gallery-title">THE<br /><em>GALLERY.</em></h2><p>Play the reel, explore the stills, and come back for more work as it is added.</p></div><div className="gallery-toolbar"><span>{String(shown.length).padStart(2, '0')} ITEMS</span><div role="group" aria-label="Filter gallery">{[['all', 'All'], ['video', 'Video'], ['photo', 'Photo']].map(([key, label]) => <button className={filter === key ? 'is-active' : ''} type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}</div></div><div className="media-grid">{shown.map((item) => <MediaTile item={item} key={item.id} onOpen={setOpenPhoto} />)}</div></section>

        <section className="projects-companies" id="companies" aria-labelledby="companies-title"><div className="projects-section projects-companies-inner"><div className="projects-section-top"><span>03 / COLLABORATIONS</span><span>PEOPLE + PLACES</span></div><div className="projects-section-heading"><h2 id="companies-title">WORKED<br /><em>WITH.</em></h2><p>{collaborators.length ? '10+ companies across creative projects. A selection of the people and places behind the work.' : '10+ companies across creative projects. Their names and logos can be added here when ready.'}</p></div><div className="projects-company-stat"><strong>10<span>+</span></strong><p>COMPANIES WORKED WITH</p></div><p className="company-directory-label">{collaborators.length ? 'COLLABORATORS' : 'COMPANY PLACEHOLDERS / REPLACE WITH REAL NAMES & LOGOS'}</p><div className="company-directory">{companies.map((company, index) => <div className="company-directory-item" key={`${company.name}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span>{company.logo ? <img src={company.logo} alt={company.name} loading="lazy" /> : <strong>{company.name}</strong>}{company.placeholder && <small>PLACEHOLDER</small>}</div>)}</div></div><CompanyMarquee dark /></section>

        <footer className="projects-footer"><p>HAVE SOMETHING IN MIND?</p><a href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer">FIND ME ON GITHUB <span aria-hidden="true">↗</span></a><div><span>AASHISH MAHATO © 2026</span><a href="../">BACK TO HOME ↗</a></div></footer>
      </main>
      {openPhoto && <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={openPhoto.title} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpenPhoto(null); }}><button type="button" onClick={() => setOpenPhoto(null)} aria-label="Close photo">CLOSE ×</button><img src={openPhoto.src} alt={openPhoto.title} /><span>{openPhoto.title}</span></div>}
    </div>
  );
}
