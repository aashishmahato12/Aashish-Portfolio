import React, { useEffect, useRef, useState } from 'react';

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
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      <button className={`menu-button ${open ? 'is-open' : ''}`} type="button" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
        <span /><span />
      </button>
      <nav className={`mobile-nav ${open ? 'is-open' : ''}`} id="mobile-nav" aria-label="Mobile navigation" aria-hidden={!open}>
        <a href="#work" onClick={() => setOpen(false)}>Work</a>
        <a href="#about" onClick={() => setOpen(false)}>About</a>
        <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
      </nav>
    </header>
  );
}

function Hero() {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setVideoReady(false));
  }, []);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-fallback" aria-hidden="true"><div className="fallback-light" /></div>
      <video ref={videoRef} className={`hero-video ${videoReady ? 'is-ready' : ''}`} autoPlay muted loop playsInline preload="metadata" poster="/videos/hero-poster.jpg" aria-hidden="true" onCanPlay={() => setVideoReady(true)} onError={() => setVideoReady(false)}>
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="hero-shade" aria-hidden="true" />
      <Header />
      <div className="hero-content">
        <span className="hero-kicker">AASHISH MAHATO <span>—</span> MULTIDISCIPLINARY CREATIVE</span>
        <h1 id="hero-title"><span>AASHISH</span><span>MAHATO<span className="hero-period">.</span></span></h1>
        <p>IMAGE <i>•</i> MOTION <i>•</i> DESIGN <i>•</i> CODE</p>
      </div>
      <a className="hero-scroll" href="#work"><span>SCROLL TO EXPLORE</span><Arrow /></a>
      <span className="hero-edition">PORTFOLIO / 2026</span>
    </section>
  );
}

function Work() {
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? projects : projects.filter((project) => project.category === filter);

  return (
    <section className="work section-wrap" id="work" aria-labelledby="work-title">
      <div className="section-index"><span>01 / SELECTED WORK</span><span>SCROLL TO DISCOVER</span></div>
      <div className="section-intro">
        <h2 id="work-title">A collection of<br /><em>possibilities.</em></h2>
        <p>Concepts across moving image, visual identity, and digital spaces. These are placeholders until my real projects are added.</p>
      </div>
      <div className="filters" role="group" aria-label="Filter projects">
        {filters.map((item) => <button key={item.key} type="button" className={filter === item.key ? 'active' : ''} aria-pressed={filter === item.key} onClick={() => setFilter(item.key)}>{item.label}</button>)}
      </div>
      <div className="project-grid">
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
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about section-wrap" id="about" aria-labelledby="about-title">
      <div className="section-index"><span>02 / ABOUT</span><span>ONE MIND, MANY MEDIUMS</span></div>
      <div className="about-grid">
        <div><p className="small-label">A LITTLE ABOUT ME</p><h2 id="about-title">I create across<br /><em>the spectrum.</em></h2></div>
        <div className="about-copy"><p>I'm Aashish Mahato. My work moves between photography, film, motion, design, and technology. I follow the idea to the medium that tells it best.</p><p>From a single frame to a complete digital experience, I care about how the details feel and what the work leaves behind.</p><a className="underlined-link" href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer">Explore my GitHub <Arrow diagonal /></a></div>
      </div>
      <div className="services"><span className="small-label">WHAT I DO</span><div>{services.map((service, index) => <span key={service}><b>{String(index + 1).padStart(2, '0')}</b>{service}</span>)}</div></div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact section-wrap" id="contact" aria-labelledby="contact-title">
      <div className="section-index"><span>03 / CONTACT</span><span>THE NEXT IDEA STARTS HERE</span></div>
      <div className="contact-main"><p>HAVE SOMETHING IN MIND?</p><h2 id="contact-title">LET'S MAKE<br /><em>IT REAL.</em></h2><a href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer">FIND ME ON GITHUB <Arrow diagonal /></a></div>
      <footer><span>© {new Date().getFullYear()} AASHISH MAHATO</span><a href="#top">BACK TO TOP ↑</a></footer>
    </section>
  );
}

export default function App() {
  return <><a className="skip-link" href="#work">Skip to work</a><Hero /><main><Work /><About /><Contact /></main></>;
}
