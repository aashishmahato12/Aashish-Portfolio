import { isWebKit } from './browser-performance.js';
import { creativeServices, projectQuestions } from './services-data.js';
import { mediaAlt, mediaDescription } from './media-text.js';
import React, { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, stagger } from 'animejs';
import App from './App.jsx';
import { SiteHeader as SiteNav, SiteFooter } from './SiteChrome.jsx';
import { searchMeta, searchImages, structuredData, officialProfiles } from './seo-data.js';
import HomePanels from './HomePanels.jsx';
import HandwrittenText from './HandwrittenText.jsx';
import ParallaxChapters from './ParallaxChapters.jsx';
import { PreviewLinkCard, PreviewLinkCardContent, PreviewLinkCardImage, PreviewLinkCardPortal, PreviewLinkCardTrigger } from './components/animate-ui/primitives/radix/preview-link-card.jsx';
import { collaborators, featuredProjects, galleryMedia, heroReel, webProjects } from './portfolio-data.js';

gsap.registerPlugin(ScrollTrigger);

const AboutTimeline = React.lazy(() => import('./AboutTimeline.jsx'));
const AboutOpening = React.lazy(() => import('./AboutSections.jsx').then((module) => ({ default: module.AboutOpening })));
const AboutAfterTimeline = React.lazy(() => import('./AboutSections.jsx').then((module) => ({ default: module.AboutAfterTimeline })));
const GalleryFinalGrid = React.lazy(() => import('./GalleryEffects.jsx').then((module) => ({ default: module.GalleryFinalGrid })));
const GalleryLetterTitle = React.lazy(() => import('./GalleryLetterTitle.jsx'));
const GalleryIsometricWave = React.lazy(() => import('./GalleryIsometricWave.jsx'));
const GalleryCinematic = React.lazy(() => import('./GalleryCinematic.jsx'));

const routeFor = (path) => {
  path = path.replace(/\/index\.html$/, '/');
  const skill = path.match(/^\/work\/(film|photography|motion|branding|graphic|digital|web)\/?$/);
  if (skill) return `skill-${skill[1]}`;
  const normalized = path.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
  return ({ '/': 'home', '/work': 'work', '/gallery': 'gallery', '/about': 'about', '/contact': 'contact' })[normalized] || 'home';
};

function updateSearchMeta(route) {
  const [title, description, path] = searchMeta[route];
  const url = `https://aashish-mahato.com.np${path}`;
  document.title = title;
  let schema = document.getElementById('portfolio-structured-data');
  if (!schema) {
    schema = document.createElement('script');
    schema.id = 'portfolio-structured-data';
    schema.type = 'application/ld+json';
    document.head.append(schema);
  }
  schema.textContent = JSON.stringify(structuredData(route));
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', `https://aashish-mahato.com.np${searchImages[route]}`);
  document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', `https://aashish-mahato.com.np${searchImages[route]}`);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:image:alt"]')?.setAttribute('content', route.startsWith('skill-') ? title : 'Aashish Mahato — creative in film, photography, design, and code');
}

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
  return <video ref={ref} className={className} src={item.src} poster={item.poster} muted={!controls} loop={!controls} controls={controls} playsInline preload="metadata" aria-label={item.title || 'Portfolio video'} title={mediaDescription(item)} />;
}

function SectionTop({ number, label, aside }) {
  return <div className="experience-section-top"><span>{number} / {label}</span><span>{aside}</span></div>;
}

function HeroCharacters({ text }) {
  return Array.from(text).map((character, index) => <span className="masked-title-char" key={`${character}-${index}`}>{character}</span>);
}

function MaskedHeroTitle({ text, id }) {
  const words = text.split(' ');
  return <h1 id={id} aria-label={`${text}.`}>{words.map((word, index) => <React.Fragment key={`${word}-${index}`}>{index > 0 && ' '}<span className="masked-title-mask" aria-hidden="true"><span className="masked-title-word"><HeroCharacters text={word} />{index === words.length - 1 && <i className="masked-title-dot">.</i>}</span></span></React.Fragment>)}</h1>;
}

function HomeCollaborators() {
  const sectionRef = useRef(null);
  useLayoutEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.from('.collaboration-card', {
        y: 20, opacity: 0, duration: .55, stagger: .035, ease: 'power2.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.collaboration-grid', start: 'top 88%', once: true },
      });
    }, sectionRef);
    return () => context.revert();
  }, []);
  return <section className="home-collaborators" ref={sectionRef} aria-labelledby="home-collaborators-title">
    <div className="experience-shell">
      <SectionTop number="04" label="COLLABORATIONS" aside="THE NAMES BEHIND THE WORK" />
      <div className="collaboration-intro">
        <div><h2 id="home-collaborators-title">Good company.<br /><em>Better work.</em></h2><p>Real collaborations across film, design, and digital.</p></div>
        <div className="collaboration-total"><strong>{collaborators.length}</strong><span>Brands &amp; teams<br />I’ve worked with</span></div>
      </div>
      <div className="collaboration-grid" aria-label="Brands and teams">{collaborators.map((company, index) =>
        <figure className="collaboration-card" key={company.name}>
          <div className="collaboration-logo"><img src={company.logo} alt={`${company.name} logo`} loading="lazy" decoding="async" /></div>
          <figcaption><span>{company.name}</span><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span></figcaption>
        </figure>
      )}</div>
      <p className="collaboration-note">Good people. Shared ideas. Work made together.</p>
    </div>
  </section>;
}

const clientTestimonials = [
  { discipline: 'Graphic design', emphasis: ['clean and thoughtful visuals', 'strong and professional visual identity'], quote: 'Aashish brought our ideas to life through clean and thoughtful visuals. His attention to detail and creative approach gave Savari a strong and professional visual identity.' },
  { discipline: 'Web', emphasis: ['clean, user-friendly website', 'overall user experience', 'polished final product'], quote: 'Aashish transformed our ideas into a clean, user-friendly website for Savari. He paid close attention to both the visual details and the overall user experience, resulting in a polished final product.' },
  { discipline: 'Videos', emphasis: ['creativity and strong storytelling', 'framing, editing, and detail'], quote: 'Aashish brought creativity and strong storytelling to Savari’s visual content. His attention to framing, editing, and detail helped create videos that effectively represented our project.' },
  {
    discipline: 'Web development & design', author: 'Hardik Maharjan', wide: true,
    emphasis: ['technical expertise, creativity, and design skills', 'dedicated, creative, and willing to go the extra mile', 'bright future ahead of him'],
    quote: 'Aashish has helped me on several of my projects, including Dream Chasers and the “Will You Go on a Date With Me?” website, and his contribution has been exceptional.\n\nAashish has a strong combination of technical expertise, creativity, and design skills. His ability to bring ideas to life through web development and thoughtful design has helped me tremendously across these projects. He is not only highly skilled but also dedicated, creative, and willing to go the extra mile to make sure the final result is something to be proud of.\n\nI genuinely appreciate all the support and hard work he has put into the projects we’ve worked on together. I have no doubt that Aashish has a bright future ahead of him, and with his talent and passion for technology, I believe he will go very far.',
  },
];

function HomeTestimonials({ number = "05" }) {
  const sectionRef = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray('.testimonial-card').forEach((card) => {
          gsap.from(card.querySelectorAll('.testimonial-word'), {
            opacity: 0, y: 4, duration: .24, stagger: Math.min(.065, 2.4 / card.querySelectorAll('.testimonial-word').length), ease: 'power1.out',
            scrollTrigger: { trigger: card, start: 'top 85%', once: true },
          });
        });
      }, sectionRef);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  return <section ref={sectionRef} className="home-testimonials" id="client-voices" aria-labelledby="testimonials-title">
    <div className="experience-shell">
      <SectionTop number={number} label="CLIENT VOICES" aside="CLIENTS & COLLABORATORS" />
      <div className="testimonials-heading"><div className="signature-heading"><HandwrittenText className="signature-accent">Feedback</HandwrittenText><h2 id="testimonials-title">From idea<br />to <em>impact.</em></h2></div><p>Creative work. Shared experiences.<br />In the words of the people I work with.</p></div>
      <div className="testimonials-grid">{clientTestimonials.map((item, index) => <figure className={`testimonial-card${item.wide ? " testimonial-card--wide" : ""}`} key={item.discipline}>
        <div className="testimonial-category"><span>{item.discipline}</span><span aria-hidden="true">0{index + 1}</span></div>
        <span className="testimonial-quote-mark" aria-hidden="true">“</span>
        <blockquote>{item.quote.split("\n\n").map((paragraph, paragraphIndex) => <p key={paragraphIndex} aria-label={paragraph}>{paragraph.split(new RegExp(`(${item.emphasis.join('|')})`, 'g')).map((part, partIndex) => {
          const words = part.split(/(\s+)/).map((word, wordIndex) => /\s+/.test(word) ? word : <span className="testimonial-word" aria-hidden="true" key={wordIndex}>{word}</span>);
          return item.emphasis.includes(part) ? <strong key={partIndex}>{words}</strong> : <React.Fragment key={partIndex}>{words}</React.Fragment>;
        })}</p>)}</blockquote>
        <figcaption><div className="testimonial-author">{item.author ? <span className="testimonial-avatar testimonial-initials" aria-hidden="true">HM</span> : <img className="testimonial-avatar" src="/media/photos/biraj-sharma.png" alt="Biraj Sharma" width="40" height="40" loading="lazy" />}<div><strong>{item.author || "Biraj Sharma"}</strong><span>{item.author ? "Developer, Dream Chasers" : "Project Manager, The Cyberians"}</span></div></div>{!item.author && <img className="testimonial-company-logo" src="/media/logos/savari.webp" alt="Savari" width="72" height="40" loading="lazy" />}</figcaption>
      </figure>)}</div>
    </div>
  </section>;
}

const homeRoles = ['FILMMAKER', 'PHOTOGRAPHER', 'MOTION DESIGNER', 'BRAND DESIGNER', 'GRAPHIC DESIGNER', 'UI DESIGNER', 'WEB DEVELOPER'];

function HomeIdentityTitle() {
  const titleRef = useRef(null);
  const lettersRef = useRef(null);
  const [role, setRole] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .4 });
    observer.observe(titleRef.current);
    return () => { observer.disconnect(); preference.removeEventListener('change', update); };
  }, []);
  useLayoutEffect(() => {
    if (!visible || paused || reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = gsap.context(() => {
      const characters = gsap.utils.toArray('.identity-flip-character');
      const timeline = gsap.timeline({ onComplete: () => setRole(index => (index + 1) % homeRoles.length) });
      timeline.fromTo(characters, { rotateX: 90, yPercent: 25, opacity: 0 }, { rotateX: 0, yPercent: 0, opacity: 1, duration: .65, stagger: .045, ease: 'power3.out' });
      timeline.to(characters, { rotateX: -90, yPercent: -25, opacity: 0, duration: .4, stagger: .03, ease: 'power2.in' }, '+=2.3');
    }, lettersRef);
    return () => context.revert();
  }, [role, visible, paused, reducedMotion]);
  return <div className="home-identity" ref={titleRef}>
    <h2 id="home-about-title" className="home-identity-title" aria-label="I am a filmmaker, photographer, motion designer, brand designer, graphic designer, UI designer, and web developer."><span className="identity-prefix" aria-hidden="true">I AM A</span><em className="identity-role" ref={lettersRef} aria-hidden="true" key={role}>{homeRoles[role].split(' ').map((word, index, words) => <span className="identity-word" key={index}>{[...(word + (index === words.length - 1 ? '.' : ''))].map((character, position) => <span className="identity-flip-character" key={position}>{character}</span>)}</span>)}</em></h2>
    <div className="identity-status"><span>{String(role + 1).padStart(2, '0')} / 07 · ONE CREATIVE, MANY DISCIPLINES</span>{!reducedMotion && <button type="button" aria-label={paused ? 'Resume skill animation' : 'Pause skill animation'} onClick={() => setPaused(!paused)}>{paused ? 'PLAY ↗' : 'PAUSE Ⅱ'}</button>}</div>
  </div>;
}

function Home({ lenisRef }) {
  const aboutRef = useRef(null);
  usePageMotion('home');
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray('.home-about-photo', aboutRef.current).forEach((photo, index) => {
          const distance = () => window.innerWidth <= 1100 ? (index === 0 ? 14 : -10) : (index === 0 ? 65 : -45);
          gsap.fromTo(photo, { y: () => distance() }, {
            y: () => -distance(), ease: 'none',
            scrollTrigger: { trigger: aboutRef.current, start: 'top bottom', end: 'bottom top', scrub: .7, invalidateOnRefresh: true },
          });
        });
      }, aboutRef);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  return <><App /><main>
    <HomePanels lenisRef={lenisRef} />
    <ParallaxChapters />

    <section className="home-about" ref={aboutRef} aria-labelledby="home-about-title"><div className="experience-shell"><SectionTop number="02" label="THE PERSON" aside="A FEW WORDS BEFORE THE WORK" /><div className="home-about-photos"><figure className="home-about-photo home-about-photo--portrait"><img src="/media/photos/tree-final-18.webp" alt="Aashish Mahato wearing round glasses in a black and white portrait" width="1200" height="1800" loading="lazy" /><figcaption>AASHISH / KATHMANDU</figcaption></figure><figure className="home-about-photo home-about-photo--field"><img src="/media/posters/manang.jpg" alt="Himalayan landscape from Aashish Mahato’s Manang travel film" loading="lazy" /><figcaption>IN THE FIELD / MANANG</figcaption></figure></div><div className="home-about-grid"><div data-reveal><span className="experience-eyebrow">WHO I AM / WHY ME</span><HomeIdentityTitle /></div><div className="home-about-copy" data-reveal><div className="home-about-facts"><span>20 years old</span><span>Kathmandu, Nepal</span></div><p>I’m Aashish Mahato, a multidisciplinary creative based in Kathmandu, Nepal. I bring ideas to life through film, photography, design, and code.</p><p>My work moves between travel films, portraits, motion graphics, brand identities, and digital experiences. From the landscapes of Mustang and Manang to campaign artwork and working websites, I explore different ways to tell a story.</p><p>Working across these disciplines lets me connect the bigger idea with the details—how it looks, how it moves, and how it works. I approach each project with curiosity, a clear visual direction, and attention to the people it’s made for.</p><p className="official-profile-links">{officialProfiles.map((profile) => <a href={profile.url} key={profile.url} target="_blank" rel="noopener noreferrer">{profile.label} ↗</a>)}</p><a className="experience-text-link" href="/about/">MORE ABOUT ME <span>↗</span></a></div></div></div></section>

    <HomeSkills />
    <HomeCollaborators />
    <HomeTestimonials />
    <ProjectGuide />
    <SiteFooter />
  </main></>;
}

const photographyProjects = galleryMedia.filter((item) => item.category === 'Photography').map((item) => ({ id: item.id, title: item.title, category: 'Photography', cover: item.src, media: [item] }));
const workSkills = [
  { id: 'film', name: 'FILM', line: 'Scenes, stories, and places in motion.', cover: featuredProjects[0].cover, preview: featuredProjects[1].cover, capabilities: ['Videography', 'Editing', 'Visual storytelling'], projects: [{ id: 'showreel', title: 'Current showreel', category: 'Film', description: 'A moving overview of my visual work.', cover: heroReel.poster, media: [heroReel] }, ...featuredProjects.filter((project) => project.category === 'Travel Film')] },
  { id: 'photography', name: 'PHOTOGRAPHY', line: 'Still images that hold a moment.', cover: photographyProjects[0].cover, preview: photographyProjects[1].cover, slides: photographyProjects.slice(0, 5).map((project) => project.cover), capabilities: ['Composition', 'Portraits', 'Landscape'], projects: photographyProjects },
  { id: 'motion', name: 'MOTION GRAPHICS', line: 'Design and ideas brought into movement.', cover: featuredProjects[2].cover, preview: featuredProjects[2].cover, capabilities: ['Animation', 'Motion design', 'Editing'], projects: featuredProjects.filter((project) => project.category === 'Motion Graphics') },
  { id: 'branding', name: 'BRANDING', line: 'Visual systems built for a name and an idea.', cover: featuredProjects[3].cover, preview: featuredProjects[4].cover, slides: [featuredProjects[3].cover, featuredProjects[4].cover, featuredProjects[3].media[1].src], capabilities: ['Visual identity', 'Art direction', 'Brand mockups'], projects: featuredProjects.filter((project) => project.category === 'Brand & Digital') },
  { id: 'graphic', name: 'GRAPHIC DESIGN', line: 'Clear visual communication across formats.', cover: featuredProjects[5].cover, preview: featuredProjects[5].media[1].src, slides: featuredProjects[5].media.slice(0, 5).map((item) => item.src), capabilities: ['Campaign graphics', 'Social design', 'Layout'], projects: featuredProjects.filter((project) => project.category === 'Graphic Design') },
  { id: 'digital', name: 'DIGITAL', line: 'Interfaces and digital concepts shaped with design.', cover: featuredProjects[3].media.find((item) => item.category === 'Digital').src, preview: featuredProjects[4].media.find((item) => item.category === 'Digital').src, slides: [...featuredProjects[3].media, ...featuredProjects[4].media].filter((item) => item.category === 'Digital').map((item) => item.src), capabilities: ['Web design', 'UI concepts', 'Frontend'], projects: featuredProjects.filter((project) => project.category === 'Brand & Digital') },
  { id: 'web', name: 'WEB DEVELOPMENT', line: 'Sites and tools made to work in the real world.', cover: webProjects[0].mark, preview: webProjects[0].mark, capabilities: ['Responsive websites', 'React interfaces', 'Web tools'], projects: webProjects },
];
const projectHref = (project) => `/work/${workSkills.find((skill) => skill.projects.some((item) => item.id === project.id))?.id || 'film'}/#${project.id}`;

function WorkProjectCard({ project, index, skillId }) {
  const video = project.media?.find((item) => item.type === 'video');
  const photos = project.media?.filter((item) => item.type === 'photo' && (skillId === 'digital' ? item.category === 'Digital' : skillId === 'branding' ? item.category === 'Branding' : true)) || [];
  const cover = photos[0]?.src || project.cover;
  const extraPhotos = photos.filter((item) => item.src !== cover);
  return <article className={`work-project-card ${['branding', 'graphic', 'digital'].includes(skillId) ? 'work-project-card--design' : ''} ${skillId === 'web' ? 'work-project-card--web' : ''}`} id={project.id} data-reveal>
    <div className="work-project-visual">{skillId === 'web' ? <div className={`web-project-art web-project-art--${project.theme}`}><div className="web-project-browser"><span /><span /><span /><small>{new URL(project.liveUrl).hostname}</small></div><div className="web-project-art-content">{project.mark && <img src={project.mark} alt="" loading="lazy" />}<span>{project.category}</span><strong>{project.title}</strong><i>↗</i></div></div> : video ? <ReelVideo item={video} controls /> : <img src={cover} alt={mediaAlt({ ...project, src: cover })} loading="lazy" />}</div>
    <div className="work-project-info"><span>{String(index + 1).padStart(2, '0')} / {project.category}</span><h3>{project.title}</h3><p>{mediaDescription(project) || project.category}</p></div>
    {skillId === 'web' && <div className="web-project-links"><a href={project.liveUrl} target="_blank" rel="noopener noreferrer">VISIT {project.title.toUpperCase()} ↗</a>{project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">{project.title.toUpperCase()} SOURCE CODE ↗</a>}</div>}
    {extraPhotos.length > 0 && <div className="work-project-extras">{extraPhotos.map((item) => <figure key={item.src}><img src={item.src} alt={mediaAlt(item)} loading="lazy" /><figcaption>{item.title}</figcaption></figure>)}</div>}
  </article>;
}

function WorkSkillCard({ skill, index }) {
  const href = `/work/${skill.id}/`;
  return <PreviewLinkCard href={href} src={skill.preview} width={320} height={200} followCursor="x" openDelay={120} closeDelay={80}>
    <PreviewLinkCardTrigger asChild><a className="work-skill-card" href={href}><span className="work-skill-card-media"><img src={skill.cover} alt="" loading="lazy" /></span><span className="work-skill-card-meta"><span>{String(index + 1).padStart(2, '0')} / {String(skill.projects.length).padStart(2, '0')} WORKS</span><span aria-hidden="true">↗</span></span><strong>{skill.name}</strong><span className="work-skill-card-line">{skill.line}</span></a></PreviewLinkCardTrigger>
    <PreviewLinkCardPortal><PreviewLinkCardContent side="top" sideOffset={16} className="work-skill-preview"><PreviewLinkCardImage alt={`${skill.name} work preview`} /><span className="work-skill-preview-info"><strong>{skill.name}</strong><span>EXPLORE {String(skill.projects.length).padStart(2, '0')} WORKS ↗</span></span></PreviewLinkCardContent></PreviewLinkCardPortal>
  </PreviewLinkCard>;
}

function ProjectGuide() {
  return <section className="project-guide" id="working-together" aria-labelledby="project-guide-title"><div className="experience-shell">
    <span className="experience-eyebrow">BASED IN KATHMANDU, NEPAL / OPEN A CONVERSATION</span>
    <h2 id="project-guide-title">CREATIVE WORK.<br /><em>WITH A CLEAR PURPOSE.</em></h2>
    <p className="project-guide-intro">I’m Aashish Mahato, a filmmaker, photographer, designer, and web developer based in Kathmandu, Nepal. Explore the work behind each discipline and tell me what you want to make.</p>
    <div className="project-guide-services">{creativeServices.map((service) => <a href={`/work/${service.id}/`} key={service.id}><h3>{service.name} <span aria-hidden="true">↗</span></h3><p>{service.description}</p></a>)}</div>
    <div className="project-guide-questions"><h3>Before we start</h3>{projectQuestions.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
    <div className="project-guide-contact"><span>HAVE A PROJECT IN MIND?</span><a href="/contact/">CONTACT AASHISH ↗</a>{officialProfiles.filter((profile) => ['Instagram', 'LinkedIn'].includes(profile.label)).map((profile) => <a href={profile.url} key={profile.url} target="_blank" rel="noopener noreferrer">LET’S TALK ON {profile.label.toUpperCase()} ↗</a>)}</div>
  </div></section>;
}

function HomeFilmPreview({ film }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const start = () => Math.min(6, Math.max(0, video.duration - 6));
    const update = () => {
      if (!visible || preference.matches || document.hidden) { video.pause(); return; }
      if (!video.getAttribute('src')) { video.src = film.src; video.load(); }
      else if (video.readyState >= 2) video.play().catch(() => {});
    };
    const loaded = () => { video.currentTime = start(); update(); };
    const loop = () => {
      if (video.currentTime >= Math.min(video.duration, start() + 6) - .15) video.currentTime = start();
    };
    video.addEventListener('loadedmetadata', loaded);
    video.addEventListener('canplay', update);
    video.addEventListener('timeupdate', loop);
    video.addEventListener('ended', loaded);
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: .2 });
    observer.observe(video);
    return () => {
      observer.disconnect(); video.pause();
      video.removeEventListener('loadedmetadata', loaded);
      video.removeEventListener('canplay', update);
      video.removeEventListener('timeupdate', loop);
      video.removeEventListener('ended', loaded);
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [film.src]);
  return <video ref={videoRef} muted playsInline preload="none" poster={film.poster} aria-label={`Six-second preview of ${film.title}`} />;
}

function HomeSkills() {
  const sectionRef = useRef(null);
  const slideRef = useRef(null);
  const travelRef = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .25 });
    observer.observe(sectionRef.current);
    return () => { preference.removeEventListener('change', update); observer.disconnect(); };
  }, []);
  useLayoutEffect(() => {
    const track = slideRef.current;
    const viewport = track.parentElement;
    const tween = gsap.timeline({
      repeat: -1, paused: true,
      onUpdate: () => {
        const position = Math.abs(Number(gsap.getProperty(track, 'x'))) / viewport.clientWidth;
        setActive(Math.floor(position + .00001) % workSkills.length);
      },
    });
    // Keep moving gently while a card is readable, then accelerate through
    // the transition and ease back into the next card's slow drift.
    const transitionEase = (progress) => .035 * progress + .965 * progress * progress * (3 - 2 * progress);
    workSkills.forEach((_, index) => {
      tween.to(track, { x: () => -(index + .12) * viewport.clientWidth, duration: 7, ease: 'none' });
      tween.to(track, { x: () => -(index + 1) * viewport.clientWidth, duration: 1.8, ease: transitionEase });
    });
    travelRef.current = tween;
    const resize = new ResizeObserver(() => {
      const progress = tween.progress();
      tween.invalidate().progress(progress);
    });
    resize.observe(viewport);
    return () => { resize.disconnect(); tween.kill(); travelRef.current = null; gsap.set(track, { clearProps: 'transform' }); };
  }, []);
  useEffect(() => {
    const update = () => {
      if (paused || interacting || !visible || reducedMotion || document.hidden) travelRef.current?.pause();
      else travelRef.current?.play();
    };
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, [paused, interacting, visible, reducedMotion]);
  const selectSkill = (index) => {
    travelRef.current?.progress(index / workSkills.length);
    setActive(index);
  };
  return <section className="home-skills home-make" id="my-work" ref={sectionRef} aria-labelledby="home-skills-title">
    <div className="experience-shell">
      <SectionTop number="03" label="MY WORK" aside="SEVEN CREATIVE DIRECTIONS" />
      <div className="work-skills-heading" data-reveal><h2 id="home-skills-title">WHAT I <em>MAKE.</em></h2><p>One idea, many ways to bring it to life. Explore my work in film, photography, design, and code.</p></div>
      <div className="make-carousel" aria-roledescription="carousel" aria-label="Creative disciplines" onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
        <div className="make-viewport"><div className="make-track" ref={slideRef}>{[...workSkills, ...workSkills].map((skill, index) => {
          const service = creativeServices.find((item) => item.id === skill.id);
          return (
        <div aria-hidden={index >= workSkills.length ? true : undefined} inert={index >= workSkills.length ? true : undefined} className="make-slide" key={`${skill.id}-${index}`} role="group" aria-roledescription="slide" aria-label={`${index % workSkills.length + 1} of ${workSkills.length}: ${skill.name}`}>
          <div className={`make-image make-slide-piece ${skill.id === 'web' ? 'make-image--web' : ''}`}><>{skill.id === 'film' ? <HomeFilmPreview film={featuredProjects[0].media[0]} /> : <img src={skill.cover} alt={mediaAlt({ src: skill.cover, title: skill.projects[0].title })} loading="lazy" />}</></div>
          <div className="make-story make-slide-piece"><div className="make-story-top"><span>{String(index % workSkills.length + 1).padStart(2, '0')} / THE PRACTICE</span><h3>{skill.name}</h3><p>{skill.line}</p></div><div className="make-story-body"><p>{service.description}</p><p>{service.evidence}</p><ul>{skill.capabilities.map((item) => <li key={item}>{item}</li>)}</ul><a href={`/work/${skill.id}/`}>EXPLORE {skill.name} <span aria-hidden="true">↗</span></a></div></div>
          <div className={`make-image make-slide-piece ${skill.id === 'web' ? 'make-image--web' : ''}`}><>{skill.id === 'film' ? <HomeFilmPreview film={featuredProjects[1].media[0]} /> : <img src={skill.preview} alt={mediaAlt({ src: skill.preview, title: skill.projects[1]?.title || skill.projects[0].title })} loading="lazy" />}</></div>
        </div>
          );
        })}</div></div>
        <div className="make-controls"><div className="make-arrows"><button type="button" aria-label="Previous discipline" onClick={() => selectSkill((active + workSkills.length - 1) % workSkills.length)}>←</button><button type="button" aria-label="Next discipline" onClick={() => selectSkill((active + 1) % workSkills.length)}>→</button>{!reducedMotion && <button className="make-pause" type="button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Enable automatic switching' : 'Pause automatic switching'}>{paused ? 'PLAY' : 'PAUSE'}</button>}</div><span>{String(active + 1).padStart(2, '0')} / 07</span></div>
        <div className="make-disciplines" aria-label="Choose a discipline">{workSkills.map((item, index) => <button type="button" key={item.id} aria-pressed={active === index} onClick={() => selectSkill(index)}>{item.name}</button>)}</div>
      </div>
    </div>
  </section>;
}

function SkillPage({ skillId }) {
  const skill = workSkills.find((item) => item.id === skillId);
  const service = creativeServices.find((item) => item.id === skillId);
  const heroVideo = skillId === 'film' ? featuredProjects[0].media[0] : skillId === 'motion' ? featuredProjects[2].media[0] : null;
  const heroVideoStart = skillId === 'film' ? 6 : 3;
  const heroRef = useRef(null);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  usePageMotion(skillId);
  useEffect(() => {
    if (!window.location.hash) return undefined;
    const frame = window.requestAnimationFrame(() => document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView());
    return () => window.cancelAnimationFrame(frame);
  }, [skillId]);
  useEffect(() => {
    if (!heroVideo) return undefined;
    const video = heroRef.current?.querySelector('.skill-hero-video');
    if (!video) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && video.dataset.ready === 'true') video.play().catch(() => {});
      else video.pause();
    }, { threshold: .1 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [heroVideo]);
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const hero = heroRef.current;
    const context = gsap.context(() => {
      const routeOverlay = document.querySelector('.experience-transition');
      const delay = routeOverlay && getComputedStyle(routeOverlay).display !== 'none' ? .48 : .05;
      const characterCount = hero.querySelectorAll('.masked-title-char').length;
      const lastCharacterAt = .32 + (characterCount - 1) * .045;
      gsap.timeline({ delay, defaults: { ease: 'power3.out' } })
        .from('.skill-hero-image', { scale: 1.12, duration: 1.4 }, 0)
        .from('.skill-hero-overline > *', { autoAlpha: 0, y: -18, duration: .65, stagger: .08 }, .12)
        .from('.skill-hero-kicker', { autoAlpha: 0, y: 20, duration: .65 }, .2)
        .from('.masked-title-char', { yPercent: 125, rotateX: -25, transformOrigin: '50% 100%', duration: .85, ease: 'power4.out', stagger: .045 }, .32)
        .from('.masked-title-dot', { autoAlpha: 0, scale: 0, rotation: -60, transformOrigin: '50% 75%', ease: 'back.out(2)', duration: .55 }, lastCharacterAt + .32)
        .from('.skill-hero-main p', { autoAlpha: 0, y: 25, duration: .75 }, lastCharacterAt + .22)
        .from('.skill-hero-bottom > span', { autoAlpha: 0, y: 16, duration: .6, stagger: .08 }, lastCharacterAt + .48);
      const slides = gsap.utils.toArray('.skill-hero-slide');
      if (slides.length > 1) {
        gsap.set(slides, { autoAlpha: 0, scale: 1.04 });
        gsap.set(slides[0], { autoAlpha: 1 });
        const slideshow = gsap.timeline({ paused: true, repeat: -1 });
        slides.forEach((slide, index) => {
          const start = index * 6;
          const next = slides[(index + 1) % slides.length];
          slideshow.to(slide, { scale: 1.16, duration: 6, ease: 'none' }, start)
            .to(next, { autoAlpha: 1, duration: 1.3, ease: 'power2.inOut' }, start + 4.7)
            .set(slide, { autoAlpha: 0, scale: 1.04 }, start + 6);
        });
        ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onEnter: () => slideshow.play(), onEnterBack: () => slideshow.play(), onLeave: () => slideshow.pause(), onLeaveBack: () => slideshow.pause() });
      }
      gsap.to('.skill-hero-image', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }, hero);
    return () => context.revert();
  }, [skillId]);
  return <div className={`inner-page skill-page skill-page--${skill.id}`}><SiteNav current="work" /><main>
    <section className="skill-hero" ref={heroRef} aria-labelledby="skill-title"><div className="skill-hero-image">{skill.slides ? skill.slides.map((src, index) => <img className="skill-hero-slide" src={src} alt="" loading={index === 0 ? "eager" : "lazy"} key={src} />) : <img src={skill.cover} alt="" />}{heroVideo && <video className={`skill-hero-video ${heroVideoReady ? 'is-ready' : ''}`} src={heroVideo.src} muted playsInline preload="metadata" poster={skill.cover} aria-hidden="true" onLoadedMetadata={(event) => { const video = event.currentTarget; video.currentTime = video.duration > heroVideoStart + 2 ? heroVideoStart : Math.max(0, video.duration * .2); }} onSeeked={(event) => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const video = event.currentTarget; video.dataset.ready = 'true'; setHeroVideoReady(true); if (video.getBoundingClientRect().bottom > 0 && video.getBoundingClientRect().top < window.innerHeight) video.play().catch(() => {}); }} onEnded={(event) => { const video = event.currentTarget; video.currentTime = video.duration > heroVideoStart + 2 ? heroVideoStart : Math.max(0, video.duration * .2); }} />}</div><div className="skill-hero-shade" /><div className="skill-hero-content experience-shell"><div className="skill-hero-overline"><a href="/work/">← ALL SKILLS</a><span>{String(workSkills.indexOf(skill) + 1).padStart(2, '0')} / {String(workSkills.length).padStart(2, '0')}</span></div><div className="skill-hero-main"><span className="skill-hero-kicker">AASHISH MAHATO / MY WORK</span><MaskedHeroTitle text={skill.name} id="skill-title" /><p>{skill.line}</p></div><div className="skill-hero-bottom"><span>SELECTED PROJECTS BELOW</span><span>SCROLL ↓</span></div></div></section>
    <section className={`work-detail work-detail--${skill.id}`}><div className="experience-shell"><nav className="work-detail-switcher" aria-label="Explore other skills">{workSkills.map((item) => <a href={`/work/${item.id}/`} key={item.id} aria-current={skill.id === item.id ? 'page' : undefined}>{item.name}</a>)}</nav><div className="work-detail-heading" data-reveal><span>{skill.name} / THE PRACTICE</span><h2>THE WORK<i>.</i></h2><p>{skill.line}</p><div className="work-detail-capabilities" aria-label={`${skill.name} skills`}>{skill.capabilities.map((capability) => <span key={capability}>{capability}</span>)}</div></div><section className="work-service-context" aria-label={`${service.name} by Aashish Mahato`}><div><h3>{service.name} by Aashish Mahato</h3><p>{service.description} Based in Kathmandu, Nepal.</p></div><div><h3>Explore the work</h3><p>{service.evidence}</p><a href="/contact/">DISCUSS A PROJECT ↗</a></div></section><div className="work-project-grid">{skill.projects.map((project, index) => <WorkProjectCard project={project} index={index} skillId={skill.id} key={project.id} />)}</div>{skill.id === 'web' && <div className="github-proof" data-reveal><div className="github-proof-heading"><div><span>PUBLIC GITHUB ACTIVITY / SEPTEMBER 2026 SNAPSHOT</span><h3>THE WORK<br /><em>BEHIND THE WORK.</em></h3><p>A snapshot of my GitHub contribution activity. Visit my profile for the latest projects and activity.</p></div><a href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer">VIEW GITHUB ↗</a></div><a className="github-proof-image" href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer" aria-label="View current GitHub contribution activity"><img src="/media/github-contributions-2026-09.png" alt="Screenshot of Aashish Mahato's GitHub contribution graph in September 2026" loading="lazy" /></a></div>}<div className="skill-page-end"><a href="/work/">← ALL SKILLS</a><a href="/gallery/">FULL GALLERY ↗</a></div></div></section>
  </main><SiteFooter /></div>;
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

  // Natural-ratio archive images change the page height as they load.
  // Re-measure downstream animations without requiring a browser zoom/resize.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    let refreshTimer;
    const refresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(grid);
    grid.addEventListener('load', refresh, true);
    grid.addEventListener('loadedmetadata', refresh, true);
    refresh();
    return () => {
      observer.disconnect();
      grid.removeEventListener('load', refresh, true);
      grid.removeEventListener('loadedmetadata', refresh, true);
      window.clearTimeout(refreshTimer);
    };
  }, []);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const titleCharacters = gsap.utils.toArray('.gallery-intro .masked-title-char');
        const routeOverlay = document.querySelector('.experience-transition');
        const delay = routeOverlay && getComputedStyle(routeOverlay).display !== 'none' ? .55 : .08;
        gsap.timeline({ delay, defaults: { ease: 'power4.out' } })
          .from(titleCharacters, { yPercent: 125, rotateX: -25, transformOrigin: '50% 100%', duration: .9, stagger: .055 }, .16)
          .from('.gallery-intro .masked-title-dot', { autoAlpha: 0, scale: 0, rotation: -60, duration: .55, ease: 'back.out(2)' }, .78)
          .from('.gallery-intro .experience-section-top', { autoAlpha: 0, y: -18, duration: .65 }, 0)
          .from('.gallery-intro > p', { autoAlpha: 0, y: 28, duration: .8 }, .8);
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
    if (image) gsap.to(image, { filter: active ? 'brightness(1.1)' : 'brightness(1)', duration: .35, ease: 'power2.out', overwrite: 'auto' });
  };

  const combined = [...galleryMedia, ...featuredProjects.flatMap((project) => (project.media || []).map((item,index) => ({ ...item, id: item.id || `${project.id}-${index}`, title: item.title || project.title })))];
  const allMedia = combined.filter((item, index) => combined.findIndex((other) => other.src === item.src) === index);
  const allPhotos = allMedia.filter((item) => item.type === 'photo');
  const items = allMedia.filter((item) => filter === 'all' || (filter === 'video' && item.type === 'video') || (filter === 'photography' && item.category === 'Photography') || (filter === 'design' && item.type === 'photo' && item.category !== 'Photography'));

  return <div className="inner-page gallery-page" ref={pageRef}>
    <SiteNav current="gallery" />
    <main>
      <section className="inner-intro gallery-intro experience-shell"><SectionTop number="01" label="GALLERY" aside="WATCH / VIEW / EXPLORE" /><div className="signature-heading signature-page-title"><HandwrittenText className="signature-accent">Explore</HandwrittenText><GalleryLetterTitle /></div><p>Moving images and still frames across photography, film, branding, and graphic design.</p></section>
      <GalleryCinematic items={allMedia} />
      <section className="gallery-content experience-shell" id="gallery-library"><div className="gallery-library-heading"><span>THE FULL ARCHIVE / PHOTOS & FILMS</span><h2>THE <em>ARCHIVE.</em></h2><p>Explore every frame. Open a photograph or play a film.</p></div><div className="gallery-controls"><span aria-live="polite">{String(items.length).padStart(2, '0')} PIECES</span><div role="group" aria-label="Gallery filter">{[['all','ALL'],['video','FILMS'],['photography','PHOTOS'],['design','DESIGN']].map(([value,label])=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>changeFilter(value)}>{label}</button>)}</div></div><div className="gallery-grid" ref={gridRef}>{items.map((item, index)=><article className="gallery-piece" id={`gallery-item-${item.id}`} key={item.id}><div className="gallery-piece-media">{item.type==='video'?<ReelVideo item={item} controls />:<button type="button" onPointerEnter={(event)=>animateHover(event,true)} onPointerLeave={(event)=>animateHover(event,false)} onClick={(event)=>{photoTriggerRef.current=event.currentTarget;setPhoto(item)}} aria-label={`Open ${item.title}`}><img src={item.src} alt={mediaAlt(item)} loading="lazy" /><span>EXPAND ↗</span></button>}</div><div className="gallery-piece-caption"><span>{String(index+1).padStart(2,'0')} / {item.category || item.type.toUpperCase()}</span><h2>{item.title}</h2></div><p className="gallery-media-description">{mediaDescription(item)}</p></article>)}</div></section>
      <GalleryIsometricWave items={allMedia} />
      <GalleryFinalGrid photos={allPhotos} />
    </main>
    <SiteFooter />
    {photo && <div className="gallery-lightbox" ref={lightboxRef} role="dialog" aria-modal="true" aria-label={photo.title} onMouseDown={(event)=>{if(event.target===event.currentTarget)closePhoto()}}><button type="button" onClick={closePhoto} aria-label="Close photo">CLOSE ×</button><img src={photo.src} alt={mediaAlt(photo)}/><div className="gallery-lightbox-meta"><span>{photo.category || 'VISUAL ARCHIVE'}</span><strong>{photo.title}</strong></div></div>}
  </div>;
}

function WorkPage() {
  usePageMotion('work');
  return <div className="inner-page work-page"><SiteNav current="work" /><main><section className="inner-intro experience-shell"><SectionTop number="01" label="WORK" aside="SELECTED PROJECTS / KATHMANDU, NEPAL" /><div className="signature-heading signature-page-title"><HandwrittenText className="signature-accent">Selected</HandwrittenText><h1>MY WORK<span>.</span></h1></div><p>Film, photography, motion, branding, graphic design, digital experiences, and websites by Aashish Mahato.</p></section><ParallaxChapters className="work-parallax-skills" label="CREATIVE DISCIPLINES" items={workSkills.map(skill => ({ title: `${skill.name}.`, line: skill.line, image: skill.cover, id: `practice-${skill.id}`, href: `/work/${skill.id}/` }))} /><section className="work-service-context experience-shell"><div><h2>Explore the visual archive</h2><p>Browse photographs, film frames, and design projects in the <a href="/gallery/">Gallery</a>, or <a href="/about/">learn about Aashish</a> and his approach.</p></div><div><h2>Have a project in mind?</h2><p><a href="/contact/">Contact Aashish Mahato</a> to discuss the scope and delivery plan.</p></div></section></main><SiteFooter /></div>;
}

function ContactPage() {
  usePageMotion('contact');
  useEffect(() => {
    if (document.getElementById('contact-font')) return;
    const font = document.createElement('link');
    font.id = 'contact-font';
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap';
    document.head.append(font);
  }, []);
  return <div className="inner-page contact-page"><SiteNav current="contact" /><main><section className="inner-intro experience-shell"><SectionTop number="01" label="CONTACT" aside="KATHMANDU, NEPAL" /><div className="signature-heading signature-page-title"><HandwrittenText className="signature-accent">Connect</HandwrittenText><h1>LET’S TALK<span>.</span></h1></div><p>Contact Aashish Mahato about film, photography, branding, graphic design, motion graphics, and web projects.</p></section><section className="contact-content experience-shell" aria-labelledby="contact-options-title"><div><span className="experience-eyebrow">YOUR PROJECT. ONE ACCOUNTABLE PARTNER.</span><h2 id="contact-options-title">Start a conversation.</h2><p>I’m based in Kathmandu, Nepal. Send me a message through Instagram or LinkedIn with what you want to make, who it’s for, and your timeline.</p><div className="contact-profile-links">{officialProfiles.filter(profile => ['Instagram', 'LinkedIn'].includes(profile.label)).map(profile => <a className="experience-text-link" href={profile.url} key={profile.url} target="_blank" rel="noopener noreferrer">Message Aashish on {profile.label} ↗</a>)}</div></div><div><h2>Before we start</h2><ul><li>What you need: a film, photographs, a visual identity, graphics, or a website.</li><li>Your audience, project scope, timeline, and budget.</li><li>Examples or references that explain your direction.</li></ul><p>Explore my <a href="/work/">Work</a>, browse the <a href="/gallery/">Gallery</a>, or read <a href="/about/">About me</a> before getting in touch.</p></div></section><HomeTestimonials number="02" /></main><SiteFooter /></div>;
}

function AboutPage() {
  return <div className="inner-page about-page"><SiteNav current="about" /><main><AboutOpening /><AboutTimeline /><AboutAfterTimeline /><HomeTestimonials number="06" /></main><SiteFooter /></div>;
}

export default function Experience() {
  const [route, setRoute] = useState(() => routeFor(window.location.pathname));
  useEffect(() => { updateSearchMeta(route); }, [route]);
  const current = useRef(route);
  const overlay = useRef(null);
  const inTransition = useRef(false);
  const lenisRef = useRef(null);

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lenis = reducedMotion.matches || isWebKit ? null : new Lenis({ autoRaf: true, anchors: true, smoothWheel: true, duration: 1.05 });
    lenisRef.current = lenis;
    const onScroll = () => ScrollTrigger.update();
    lenis?.on('scroll', onScroll);
    return () => { lenis?.off('scroll', onScroll); lenis?.destroy(); lenisRef.current = null; window.history.scrollRestoration = previousRestoration; };
  }, []);

  useEffect(() => {
    if (!window.location.hash) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target && lenisRef.current) lenisRef.current.scrollTo(target, { immediate: true, force: true });
      else target?.scrollIntoView();
      ScrollTrigger.refresh();
    });
    return () => window.cancelAnimationFrame(frame);
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
        updateSearchMeta(next);
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
      if (url.origin !== window.location.origin || !(/^\/work\/(?:film|photography|motion|branding|graphic|digital|web)\/$/.test(url.pathname) || ['/','/work/','/gallery/','/about/','/contact/'].includes(url.pathname)) || routeFor(url.pathname) === current.current) return;
      event.preventDefault();
      moveTo(url, true);
    };
    const onPop = () => moveTo(new URL(window.location.href), false);
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPop);
    return () => { document.removeEventListener('click', onClick); window.removeEventListener('popstate', onPop); };
  }, []);

  const Page = route.startsWith('skill-') ? SkillPage : { home: Home, work: WorkPage, gallery: GalleryPage, about: AboutPage, contact: ContactPage }[route];
  return <><Suspense fallback={<div role="status" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#111111', color: '#ffffff' }}>Opening {route === 'gallery' ? 'gallery' : 'about'}…</div>}><div key={route}><Page skillId={route.startsWith('skill-') ? route.slice(6) : undefined} lenisRef={lenisRef} /></div></Suspense><div className="experience-transition" ref={overlay} aria-hidden="true"><span>A/M<small>®</small></span><i /><p>IMAGE · MOTION · DESIGN · CODE</p></div></>;
}
