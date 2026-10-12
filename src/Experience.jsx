import { privacySections, privacyProviders, privacyUpdated } from './privacy-content.js';
import { isWebKit } from './browser-performance.js';
import { creativeServices, projectQuestions } from './services-data.js';
import { mediaAlt, mediaDescription } from './media-text.js';
import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, stagger } from 'animejs';
import App from './App.jsx';
import { SiteHeader as SiteNav, SiteFooter } from './SiteChrome.jsx';
import { searchMeta, searchImages, structuredData, officialProfiles } from './seo-data.js';
import HomePanels from './HomePanels.jsx';
import Masonry from './Masonry.jsx';
import { Button as AnimatedButton } from './components/animate-ui/components/buttons/button.jsx';
import HandwrittenText from './HandwrittenText.jsx';
import ParallaxChapters from './ParallaxChapters.jsx';
import { PreviewLinkCard, PreviewLinkCardContent, PreviewLinkCardImage, PreviewLinkCardPortal, PreviewLinkCardTrigger } from './components/animate-ui/primitives/radix/preview-link-card.jsx';
import { collaborators, featuredProjects, filmProjects, galleryMedia, heroReel, webProjects } from './portfolio-data.js';

gsap.registerPlugin(ScrollTrigger);

const AboutTimeline = React.lazy(() => import('./AboutTimeline.jsx'));
const AboutOpening = React.lazy(() => import('./AboutSections.jsx').then((module) => ({ default: module.AboutOpening })));
const AboutAfterTimeline = React.lazy(() => import('./AboutSections.jsx').then((module) => ({ default: module.AboutAfterTimeline })));
const GalleryFinalGrid = React.lazy(() => import('./GalleryEffects.jsx').then((module) => ({ default: module.GalleryFinalGrid })));
const GalleryLetterTitle = React.lazy(() => import('./GalleryLetterTitle.jsx'));
const GalleryCinematic = React.lazy(() => import('./GalleryCinematic.jsx'));
const GalleryIsometricWave = React.lazy(() => import('./GalleryIsometricWave.jsx'));

const routeFor = (path) => {
  path = path.replace(/\/index\.html$/, '/');
  const skill = path.match(/^\/work\/(film|photography|motion|branding|graphic|digital|web)\/?$/);
  if (skill) return `skill-${skill[1]}`;
  const normalized = path.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
  return ({ '/': 'home', '/work': 'work', '/gallery': 'gallery', '/about': 'about', '/contact': 'contact', '/privacy': 'privacy' })[normalized] || 'home';
};

function updateSearchMeta(route) {
  const [title, description, path] = searchMeta[route];
  const url = `https://aashish-mahato.com.np${path}`;
  document.title = title;
  document.querySelector('link[rel="alternate"][type="text/markdown"]')?.setAttribute('href', `${path}index.md`);
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
  return <video ref={ref} className={className} src={item.src} poster={item.poster} muted loop={!controls} controls={controls} playsInline preload="metadata" aria-label={item.title || 'Portfolio video'} title={mediaDescription(item)} />;
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
  const wallTweens = useRef([]);
  const pausedRef = useRef(false);
  const [wallPaused, setWallPaused] = useState(false);
  const rows = [collaborators.slice(0, 5), collaborators.slice(5, 9), collaborators.slice(9)];
  const setWallMotion = (paused) => {
    pausedRef.current = paused;
    setWallPaused(paused);
    wallTweens.current.forEach((tween) => paused ? tween.pause() : tween.resume());
  };
  useLayoutEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.from('.collaboration-title-char', {
        rotationX: 75, rotationY: -18, z: -140, y: 45, autoAlpha: 0,
        transformOrigin: '50% 80%', duration: 1.05, stagger: .045, ease: 'power3.out',
        scrollTrigger: { trigger: '#home-collaborators-title', start: 'top 88%', once: true },
      });
      wallTweens.current = gsap.utils.toArray('.logo-wall-track').map((track, index) => {
        const tween = gsap.fromTo(track, { xPercent: index % 2 ? -50 : 0 }, {
          xPercent: index % 2 ? 0 : -50, duration: index === 0 ? 40 : 34,
          repeat: -1, ease: 'none', paused: true,
        });
        ScrollTrigger.create({ trigger: track, start: 'top bottom', end: 'bottom top',
          onToggle: ({ isActive }) => isActive && !pausedRef.current ? tween.resume() : tween.pause() });
        return tween;
      });
    }, sectionRef);
    return () => { context.revert(); wallTweens.current = []; };
  }, []);
  return <section className="home-collaborators" ref={sectionRef} aria-labelledby="home-collaborators-title">
    <div className="experience-shell">
      <SectionTop number="04" label="COLLABORATIONS" aside="BRANDS AND TEAMS" />
      <div className="collaboration-intro">
        <div><h2 id="home-collaborators-title" aria-label="Clients & teams."><span className="collaboration-title-word" aria-hidden="true">{Array.from('Clients').map((letter, index) => <span className="collaboration-title-char" key={index}>{letter}</span>)}</span>{' '}<span className="collaboration-title-char" aria-hidden="true">&amp;</span>{' '}<em className="collaboration-title-word" aria-hidden="true">{Array.from('teams.').map((letter, index) => <span className="collaboration-title-char" key={index}>{letter}</span>)}</em></h2><p>Brands and teams I’ve worked with on film, design, and web projects.</p></div>
        <div className="collaboration-total"><strong>{collaborators.length}</strong><span>Brands &amp; teams<br />I’ve worked with</span></div>
      </div>
      <div className="logo-wall" aria-label="Brands and teams" onPointerEnter={() => wallTweens.current.forEach((tween) => tween.pause())} onPointerLeave={() => { if (!pausedRef.current) wallTweens.current.forEach((tween) => tween.resume()); }} onPointerDown={(event) => { if (event.pointerType === 'touch') setWallMotion(true); }}>
        {rows.map((companies, rowIndex) => <div className="logo-wall-row" key={rowIndex}><div className="logo-wall-track">
          {[0, 1].map((copy) => <div className="logo-wall-group" key={copy} aria-hidden={copy === 1 || undefined}>{[...companies, ...companies].map((company, companyIndex) => <figure className="collaboration-card" key={`${company.name}-${companyIndex}`} aria-hidden={companyIndex >= companies.length || undefined}>
            <div className="collaboration-logo"><img src={company.logo} alt={`${company.name} logo`} loading="lazy" decoding="async" /></div>
            <figcaption>{company.name}</figcaption>
          </figure>)}</div>)}
        </div></div>)}
      </div>
      <div className="logo-wall-controls"><button type="button" aria-pressed={wallPaused} onClick={() => setWallMotion(!wallPaused)}>{wallPaused ? 'Resume' : 'Pause'} logo motion</button></div>
      <p className="collaboration-note">Film, design, and web projects for these brands and teams.</p>
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
  {"discipline": "Cosmic Electrical Limited", "author": "Mahesh Mahato", "avatar": "/media/photos/mahesh-mahato.png", "role": "Founder & Managing Director", "company": "Cosmic Electrical Limited", "logo": "/media/logos/cosmic-electrical.webp", "emphasis": ["attention to detail"], "quote": "Aashish brings a unique combination of creativity, technical understanding, and dedication to his work. From visual storytelling and video production to graphic design and digital presentation, he has consistently demonstrated the ability to translate our company’s vision into meaningful creative work. His attention to detail, willingness to learn, and commitment to quality make him a promising young creative professional."},
  {"discipline": "Cosmic Group", "author": "Cosmic Group", "role": "Corporate Team", "company": "Cosmic Group", "logo": "/media/logos/cosmic-group.webp", "emphasis": ["creative"], "quote": "Aashish has contributed to strengthening our digital and visual identity across multiple businesses. His versatility in website development, graphic design, and multimedia production allows him to approach projects with both creative vision and technical precision. He brings fresh perspectives, thoughtful execution, and a strong sense of responsibility to every assignment."},
  {"discipline": "Cosmic Innovation Center (CIC Nepal)", "author": "CIC Nepal", "role": "Management Team", "company": "Cosmic Innovation Center (CIC Nepal)", "logo": "/media/logos/cic.webp", "emphasis": ["attention to detail"], "quote": "Creativity and innovation go hand in hand, and Aashish demonstrates both. His contributions to our visual identity, digital presence, and promotional materials reflect a strong understanding of modern design and communication. He approaches creative challenges with curiosity, initiative, and a genuine interest in technology, making him a valuable contributor to our innovation-driven environment."},
  {"discipline": "Cosmic Foundation", "author": "Cosmic Foundation", "role": "Management Team", "company": "Cosmic Foundation", "logo": "/media/logos/cosmic-foundation.webp", "emphasis": ["attention to detail"], "quote": "Aashish understands that effective design is not simply about aesthetics, but about communicating purpose. His creative contributions have helped us present our initiatives with clarity and visual impact. Through thoughtful design and storytelling, he demonstrates an ability to connect meaningful ideas with audiences in an engaging and professional way."},
  {"discipline": "Cosmic Capital Pvt. Ltd.", "author": "Cosmic Capital", "role": "Management Team", "company": "Cosmic Capital Pvt. Ltd.", "logo": "/media/logos/cosmic-capital.webp", "emphasis": ["attention to detail"], "quote": "Aashish combines creative thinking with a practical understanding of digital communication. His work reflects a thoughtful approach to visual consistency, professional presentation, and modern design. He has shown the ability to understand business requirements and translate them into clear, engaging digital experiences that support our corporate identity."},
  {"discipline": "Cosmic Infra Pvt. Ltd.", "author": "Cosmic Infra", "role": "Management Team", "company": "Cosmic Infra Pvt. Ltd.", "logo": "/media/logos/cosmic-infra.webp", "emphasis": ["attention to detail"], "quote": "Aashish has demonstrated a strong ability to transform technical and corporate information into visually compelling content. His approach to website presentation, graphic design, and digital communication reflects creativity, precision, and attention to detail. He consistently strives to deliver work that is both visually refined and aligned with our professional standards."},
];

function HomeTestimonials({ number = "05" }) {
  const testimonials = useMemo(() => {
    const shuffled = [...clientTestimonials];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }, []);
  const sectionRef = useRef(null);
  const rowTweens = useRef([]);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const changeMotion = (value) => {
    pausedRef.current = value;
    setPaused(value);
    rowTweens.current.forEach((tween) => value ? tween.pause() : tween.resume());
  };
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.from('.review-title-char', {
          rotationX: 75, rotationY: -18, z: -140, y: 45, autoAlpha: 0,
          transformOrigin: '50% 80%', duration: 1.05, stagger: .045, ease: 'power3.out',
          scrollTrigger: { trigger: '#testimonials-title', start: 'top 88%', once: true },
        });
        rowTweens.current = gsap.utils.toArray('.review-row-track').map((track, index) => {
          const tween = gsap.fromTo(track, { xPercent: index ? -50 : 0 }, {
            xPercent: index ? 0 : -50, duration: 70, repeat: -1, ease: 'none', paused: true,
          });
          ScrollTrigger.create({ trigger: track, start: 'top bottom', end: 'bottom top',
            onToggle: ({ isActive }) => isActive && !pausedRef.current ? tween.resume() : tween.pause() });
          return tween;
        });
      }, sectionRef);
      return () => { context.revert(); rowTweens.current = []; };
    });
    return () => media.revert();
  }, [testimonials]);
  const renderCard = (item, index) => (<figure className="testimonial-card" key={item.discipline}>
        <div className="testimonial-category"><span>{item.discipline}</span><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span></div>
        <span className="testimonial-quote-mark" aria-hidden="true">“</span>
        <blockquote>{item.quote.split("\n\n").map((paragraph, paragraphIndex) => <p key={paragraphIndex} aria-label={paragraph}>{paragraph.split(new RegExp(`(${item.emphasis.join('|')})`, 'g')).map((part, partIndex) => {
          const words = part.split(/(\s+)/).map((word, wordIndex) => /\s+/.test(word) ? word : <span className="testimonial-word" aria-hidden="true" key={wordIndex}>{word}</span>);
          return item.emphasis.includes(part) ? <strong key={partIndex}>{words}</strong> : <React.Fragment key={partIndex}>{words}</React.Fragment>;
        })}</p>)}</blockquote>
        <figcaption><div className="testimonial-author">{item.avatar ? <img className="testimonial-avatar" src={item.avatar} alt={item.author} width="40" height="40" loading="lazy" /> : item.author ? <span className="testimonial-avatar testimonial-initials" aria-hidden="true">{item.author.split(/\s+/).map((word) => word[0]).slice(0, 2).join('')}</span> : <img className="testimonial-avatar" src="/media/photos/biraj-sharma.png" alt="Biraj Sharma" width="40" height="40" loading="lazy" />}<div><strong>{item.author || "Biraj Sharma"}</strong><span>{item.role || (item.author ? "Developer, Dream Chasers" : "Project Manager, The Cyberians")}</span></div></div><img className="testimonial-company-logo" src={item.logo || (item.author ? "/media/logos/dream-chaser.jpg" : "/media/logos/savari.webp")} alt={item.company || (item.author ? "Dream Chaser" : "Savari")} width="72" height="40" loading="lazy" /></figcaption>
      </figure>);
  return <section ref={sectionRef} className="home-testimonials home-testimonials--reference" id="client-voices" aria-labelledby="testimonials-title">
    <div className="experience-shell"><div className="reviews-panel">
      <div className="testimonials-heading"><h2 id="testimonials-title" aria-label="Client reviews."><span className="review-title-word" aria-hidden="true">{Array.from('Client').map((letter, index) => <span className="review-title-char" key={index}>{letter}</span>)}</span>{' '}<em className="review-title-word" aria-hidden="true">{Array.from('reviews.').map((letter, index) => <span className="review-title-char" key={index}>{letter}</span>)}</em></h2><p>Feedback from clients and people I’ve worked with.</p></div>
      <div className="review-rows" onPointerEnter={() => rowTweens.current.forEach((tween) => tween.pause())} onPointerLeave={() => { if (!pausedRef.current) rowTweens.current.forEach((tween) => tween.resume()); }} onPointerDown={(event) => { if (event.pointerType === 'touch') changeMotion(true); }} onFocusCapture={() => rowTweens.current.forEach((tween) => tween.pause())} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget) && !pausedRef.current) rowTweens.current.forEach((tween) => tween.resume()); }}>
        {[testimonials.slice(0, 5), testimonials.slice(5)].map((row, rowIndex) => <div className="review-row" key={rowIndex}><div className="review-row-track">
          {[0, 1].map((copy) => <div className="review-row-group" key={copy} aria-hidden={copy === 1 || undefined}>{row.map((item, index) => renderCard(item, rowIndex * 5 + index))}</div>)}
        </div></div>)}
      </div>
      <div className="reviews-controls"><button type="button" aria-pressed={paused} onClick={() => changeMotion(!paused)}>{paused ? 'Resume' : 'Pause'} motion</button></div>
    </div></div>
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
    <div className="identity-status"><span className="identity-counter" key={role}>{String(role + 1).padStart(2, '0')} / 07 · MY SKILLS</span>{!reducedMotion && <button type="button" aria-label={paused ? 'Resume skill animation' : 'Pause skill animation'} onClick={() => setPaused(!paused)}>{paused ? 'PLAY ↗' : 'PAUSE Ⅱ'}</button>}</div>
  </div>;
}

function Home({ lenisRef }) {
  const aboutRef = useRef(null);
  usePageMotion('home');
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const copy = aboutRef.current.querySelector('.home-about-copy');
        const reveal = gsap.timeline({ scrollTrigger: { trigger: copy, start: 'top 85%', once: true } });
        reveal.from(copy.querySelectorAll('.home-about-facts span'), { autoAlpha: 0, y: 18, rotationX: 35, duration: .65, stagger: .1, ease: 'power3.out' })
          .from(copy.querySelectorAll(':scope > p:not(.official-profile-links)'), { autoAlpha: 0, y: 28, duration: .85, stagger: .18, ease: 'power3.out' }, '-=.3')
          .from(copy.querySelectorAll('.official-profile-links a'), { autoAlpha: 0, y: 16, duration: .5, stagger: .07, ease: 'power3.out' }, '-=.4')
          .from(copy.querySelector('.experience-text-link'), { autoAlpha: 0, y: 16, duration: .6, ease: 'power3.out' }, '-=.2');
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

    <section className="home-about" ref={aboutRef} aria-labelledby="home-about-title"><div className="experience-shell"><SectionTop number="02" label="ABOUT ME" aside="KATHMANDU, NEPAL" /><div className="home-about-photos"><figure className="home-about-photo home-about-photo--portrait"><img src="/media/photos/tree-final-18.webp" alt="Aashish Mahato wearing round glasses in a black and white portrait" width="1200" height="1800" loading="lazy" /><figcaption>AASHISH / KATHMANDU</figcaption></figure><figure className="home-about-photo home-about-photo--field"><img src="/media/posters/manang.jpg" alt="Himalayan landscape from Aashish Mahato’s Manang travel film" loading="lazy" /><figcaption>IN THE FIELD / MANANG</figcaption></figure></div><div className="home-about-grid"><div data-reveal><span className="experience-eyebrow">ABOUT ME</span><HomeIdentityTitle /></div><div className="home-about-copy"><div className="home-about-facts"><span>20 years old</span><span>Kathmandu, Nepal</span></div><p>I’m Aashish Mahato, based in Kathmandu, Nepal. I’m the Creative Head at Cosmic Group. I work in filmmaking, photography, graphic design, and web development.</p><p>My projects include travel films from Mustang and Manang, portraits, social media graphics, brand designs, and websites.</p><p>I started using a computer in 2020 and began graphic design in 2023. I later explored filmmaking and photography. At Herald College Kathmandu, I’m learning web development and motion graphics.</p><p className="official-profile-links">{officialProfiles.map((profile) => <a href={profile.url} key={profile.url} target="_blank" rel="noopener noreferrer">{profile.label} ↗</a>)}</p><a className="experience-text-link" href="/about/">MORE ABOUT ME <span>↗</span></a></div></div></div></section>

    <HomeSkills />
    <HomeCollaborators />
    <HomeTestimonials />
    <ProjectGuide />
    <SiteFooter />
  </main></>;
}

const photographyProjects = galleryMedia.filter((item) => item.category === 'Photography').map((item) => ({ id: item.id, title: item.title, category: 'Photography', cover: item.src, media: [item] }));
const workSkills = [
  { id: 'film', name: 'FILM', line: 'Travel films, corporate videos, and editing.', cover: filmProjects[0].cover, preview: filmProjects[1].cover, capabilities: ['Videography', 'Editing', 'Visual storytelling'], projects: filmProjects },
  { id: 'photography', name: 'PHOTOGRAPHY', line: 'Portrait, street, nature, and landscape photography.', cover: photographyProjects[0].cover, preview: photographyProjects[1].cover, slides: photographyProjects.slice(0, 5).map((project) => project.cover), capabilities: ['Composition', 'Portraits', 'Landscape'], projects: photographyProjects },
  { id: 'motion', name: 'MOTION GRAPHICS', line: 'Animation and product videos.', cover: featuredProjects[2].cover, preview: featuredProjects[2].cover, capabilities: ['Animation', 'Motion design', 'Editing'], projects: featuredProjects.filter((project) => project.category === 'Motion Graphics') },
  { id: 'branding', name: 'BRANDING', line: 'Brand identities, business cards, and booklets.', cover: featuredProjects[3].cover, preview: featuredProjects[4].media.find(item => item.category === 'Branding').src, slides: [featuredProjects[3].cover, featuredProjects[4].cover, featuredProjects[3].media[1].src], capabilities: ['Visual identity', 'Art direction', 'Brand mockups'], projects: featuredProjects.filter((project) => project.category === 'Brand & Digital') },
  { id: 'graphic', name: 'GRAPHIC DESIGN', line: 'Social media posters and campaign graphics.', cover: featuredProjects[5].cover, preview: featuredProjects[5].media[1].src, slides: ['dashain-puja', '162', '158', 'tihar', '25'].map((file) => `/media/design/${file}.webp`), capabilities: ['Campaign graphics', 'Social design', 'Layout'], projects: featuredProjects.filter((project) => project.category === 'Graphic Design') },
  { id: 'digital', name: 'UI/UX DESIGN', line: 'Website, dashboard, and mobile interface designs.', cover: featuredProjects[3].media.find((item) => item.category === 'Digital').src, preview: featuredProjects[4].media.find((item) => item.category === 'Digital').src, slides: [...featuredProjects[3].media, ...featuredProjects[4].media].filter((item) => item.category === 'Digital').map((item) => item.src), capabilities: ['Web design', 'UI concepts', 'Frontend'], projects: featuredProjects.filter((project) => project.category === 'Brand & Digital') },
  { id: 'web', name: 'WEB DEVELOPMENT', line: 'Responsive websites, React interfaces, and web tools.', cover: webProjects[0].mark, preview: webProjects[0].mark, capabilities: ['Responsive websites', 'React interfaces', 'Web tools'], projects: webProjects },
];
const projectHref = (project) => `/work/${workSkills.find((skill) => skill.projects.some((item) => item.id === project.id))?.id || 'film'}/#${project.id}`;

function WebProjectVisual({ project }) {
  return <div className={`web-project-art web-project-art--${project.theme}`}><div className="web-project-browser"><span /><span /><span /><small>{new URL(project.liveUrl).hostname}</small></div><div className="web-project-art-content">{project.mark && <img src={project.mark} alt="" loading="lazy" />}<span>{project.category}</span><strong>{project.title}</strong><i>↗</i></div></div>;
}

const workMasonryVisual = (item) => item.type === 'web' ? <WebProjectVisual project={item.project} /> : null;
const workMasonryDetails = (item) => <div className="work-masonry-info">
  <span>{item.category === 'Digital' ? 'UI/UX Design' : item.category}</span><h3>{item.title}</h3>
  {item.description && <p>{item.description}</p>}
  {item.type === 'youtube' && <a href={`https://www.youtube.com/watch?v=${item.youtubeId}`} target="_blank" rel="noopener noreferrer">WATCH ON YOUTUBE ↗</a>}
  {item.type === 'web' && <div className="work-masonry-links"><a href={item.project.liveUrl} target="_blank" rel="noopener noreferrer">VISIT WEBSITE ↗</a>{item.project.repoUrl && <a href={item.project.repoUrl} target="_blank" rel="noopener noreferrer">SOURCE CODE ↗</a>}</div>}
</div>;

function WorkMediaGallery({ skill }) {
  const [selected, setSelected] = useState(null);
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const galleryRef = useRef(null);
  const items = useMemo(() => skill.projects.flatMap(project => {
    if (skill.id === 'web') return [{ id: project.id, anchorId: project.id, type: 'web', title: project.title, category: project.category, description: project.description, aspectRatio: 4 / 3, project }];
    return (project.media || []).filter(item => skill.id === 'branding' ? item.category === 'Branding' : skill.id === 'digital' ? item.category === 'Digital' : true).map((item, index) => ({
      ...item, id: `${project.id}-${index}`, anchorId: index === 0 ? project.id : undefined,
      title: item.type === 'photo' ? item.title || project.title : project.title,
      category: item.category || project.category,
      description: index === 0 ? project.description : undefined,
      poster: item.poster || project.cover,
      ...(item.type === 'youtube' ? { src: project.cover, aspectRatio: 16 / 9 } : {}),
    }));
  }), [skill]);

  useEffect(() => {
    const observer = new ResizeObserver(() => ScrollTrigger.refresh());
    observer.observe(galleryRef.current);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!selected || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.from(dialogRef.current, { opacity: 0, duration: .3 });
      gsap.from('.work-media-preview', { y: 24, scale: .96, duration: .5, ease: 'power3.out' });
    }, dialogRef);
    return () => context.revert();
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current.querySelector('button').focus();
    const onKey = event => {
      if (event.key === 'Escape') setSelected(null);
      if (event.key === 'Tab') {
        const targets = [...dialogRef.current.querySelectorAll('button, a, iframe, video[controls]')];
        const first = targets[0], last = targets[targets.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); triggerRef.current?.focus(); };
  }, [selected]);

  return <div className={`work-masonry-gallery${items.length === 1 ? ' work-masonry-single' : ''}`} ref={galleryRef}>
    <Masonry items={items} maxColumns={3} paused={Boolean(selected)} renderVisual={workMasonryVisual} renderDetails={workMasonryDetails} onOpen={(item, trigger) => { triggerRef.current = trigger; setSelected(item); }} />
    {selected && <div className="work-media-lightbox" ref={dialogRef} role="dialog" aria-modal="true" aria-label={selected.title} onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}>
      <button className="work-media-close" type="button" onClick={() => setSelected(null)} aria-label="Close preview">CLOSE ×</button>
      <div className="work-media-preview">
        {selected.type === 'youtube' ? <iframe src={`https://www.youtube-nocookie.com/embed/${selected.youtubeId}?autoplay=1&mute=1&playsinline=1&rel=0`} title={selected.title} allow="autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          : selected.type === 'video' ? <ReelVideo item={selected} controls />
          : selected.type === 'web' ? <div className="work-web-preview"><WebProjectVisual project={selected.project} /></div>
          : <img src={selected.src} alt={mediaAlt(selected)} />}
        {workMasonryDetails(selected)}
      </div>
    </div>}
  </div>;
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
    <span className="experience-eyebrow">SERVICES / KATHMANDU, NEPAL</span>
    <h2 id="project-guide-title">MY <em>SERVICES.</em></h2>
    <p className="project-guide-intro">I offer filmmaking, photography, design, and web development. View examples below or contact me to discuss a project.</p>
    <div className="project-guide-services">{creativeServices.map((service) => <a href={`/work/${service.id}/`} key={service.id}><h3>{service.name} <span aria-hidden="true">↗</span></h3><p>{service.description}</p></a>)}</div>
    <div className="project-guide-questions"><h3>Frequently asked questions</h3>{projectQuestions.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
    <div className="project-guide-contact"><span>DISCUSS A PROJECT</span><a href="/contact/">CONTACT AASHISH ↗</a>{officialProfiles.filter((profile) => ['Instagram', 'LinkedIn'].includes(profile.label)).map((profile) => <a href={profile.url} key={profile.url} target="_blank" rel="noopener noreferrer">MESSAGE ME ON {profile.label.toUpperCase()} ↗</a>)}</div>
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
  const showcaseRef = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [alternateSkill, setAlternateSkill] = useState(null);
  const [photoFrame, setPhotoFrame] = useState(0);
  const [imageAccent, setImageAccent] = useState(null);
  const skill = workSkills[active];
  const service = creativeServices.find(item => item.id === skill.id);
  const alternate = alternateSkill === skill.id;
  const photoFrames = skill.projects.flatMap(project => (project.media || [])
    .filter(item => item.type === 'photo' && (skill.id === 'branding' ? item.category === 'Branding' : skill.id === 'digital' ? item.category === 'Digital' : true))
    .map(item => ({ ...item, projectId: project.id })));
  const currentPhoto = photoFrames[photoFrame % photoFrames.length];
  const nextPhoto = photoFrames[(photoFrame + 1) % photoFrames.length];
  const canSwitch = skill.id === 'film' || skill.id === 'web' || photoFrames.length > 1;
  const webPreview = alternate ? webProjects[1] : webProjects[0];
  const previewImage = skill.id === 'web'
    ? `/media/web/${alternate ? 'unisync' : 'cosmic'}-website.png`
    : currentPhoto?.src || (alternate ? skill.preview : skill.cover);
  const otherImage = skill.id === 'web'
    ? `/media/web/${alternate ? 'cosmic' : 'unisync'}-website.png`
    : nextPhoto?.src || (alternate ? skill.cover : skill.preview);
  const defaultAccent = { film: alternate ? '#245e68' : '#285a91', photography: '#246879', motion: '#254a8b', branding: '#28578a', graphic: '#a83229', digital: '#326347', web: alternate ? '#4e4693' : '#b22f35' }[skill.id];
  const accent = imageAccent || defaultAccent;
  const sampleAccent = event => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 12;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(event.currentTarget, 0, 0, 12, 12);
      const pixels = context.getImageData(0, 0, 12, 12).data;
      const sums = [0, 0, 0]; let count = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const channels = [pixels[i], pixels[i + 1], pixels[i + 2]];
        const max = Math.max(...channels), min = Math.min(...channels);
        if (max < 45 || max - min < 35) continue;
        channels.forEach((value, channel) => { sums[channel] += value; }); count++;
      }
      if (count) {
        const average = sums.map(value => value / count);
        const shade = 115 / Math.max(...average);
        setImageAccent(`rgb(${average.map(value => Math.round(value * shade)).join(',')})`);
      }
    } catch { /* Keep the skill colour when a remote image cannot be sampled. */ }
  };
  const supportingMedia = skill.projects.flatMap(project => (project.media || [])
    .filter(item => skill.id === 'branding' ? item.category === 'Branding' : skill.id === 'digital' ? item.category === 'Digital' : true)
    .map(item => ({ ...item, image: item.type === 'photo' ? item.src : item.poster || project.cover, projectId: project.id })))
    .find(item => item.image && item.image !== previewImage && item.image !== otherImage);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .2 });
    observer.observe(sectionRef.current);
    return () => { preference.removeEventListener('change', update); observer.disconnect(); };
  }, []);
  useEffect(() => {
    setPhotoFrame(0);
    setImageAccent(null);
  }, [active, alternate]);
  useEffect(() => {
    if ((photoFrames.length < 2 && skill.id !== 'web') || paused || interacting || !visible || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      if (skill.id === 'web') setAlternateSkill(value => value === 'web' ? null : 'web');
      else setPhotoFrame(index => index + 1);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [active, photoFrames.length, paused, interacting, visible, reducedMotion]);
  useEffect(() => {
    if (paused || interacting || !visible || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(index => (index + 1) % workSkills.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [active, paused, interacting, visible, reducedMotion]);
  useLayoutEffect(() => {
    if (!visible) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const entrance = gsap.timeline();
        entrance.from('.skills-showcase-media, .skills-bento-overview, .skills-bento-photo, .skills-bento-preview', {
          opacity: 0, y: 32, rotationX: 7, scale: .97, transformPerspective: 1000,
          duration: .85, stagger: .09, ease: 'power3.out',
        }).from('.skills-bento-overview > *', {
          opacity: 0, x: -18, duration: .65, stagger: .07, ease: 'power3.out',
        }, .2);
      }, showcaseRef);
      return () => context.revert();
    });
    return () => media.revert();
  }, [active, visible]);
  const selectSkill = index => setActive((index + workSkills.length) % workSkills.length);
  return <section className="home-skills home-make" id="my-work" ref={sectionRef} aria-labelledby="home-skills-title">
    <div className="experience-shell">
      <SectionTop number="03" label="MY WORK" aside="FILM / DESIGN / WEB" />
      <div className="work-skills-heading" data-reveal><h2 id="home-skills-title">MY <em>SKILLS.</em></h2><p>View my skills and projects in film, photography, design, and web development.</p></div>
      <div className="skills-showcase" aria-roledescription="carousel" aria-label="Creative disciplines" onPointerEnter={event => { if (event.pointerType === 'mouse') setInteracting(true); }} onPointerLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
        <div className={`skills-showcase-slide skills-bento skills-bento--${skill.id}${canSwitch ? "" : " skills-bento--single"}`} style={{ '--skill-accent': accent }} ref={showcaseRef} role="group" aria-roledescription="slide" aria-label={`${active + 1} of ${workSkills.length}: ${skill.name}`} key={skill.id}>
          <div className={`skills-showcase-media${skill.id === 'web' ? ' skills-showcase-media--website' : ''}`}>
            <a className="skills-preview-main" href={skill.id === 'web' ? `/work/web/#${webPreview.id}` : `/work/${skill.id}/`} aria-label={`Explore ${skill.name.toLowerCase()} projects`}>
              {skill.id === 'film' ? <HomeFilmPreview key={alternate ? 'manang' : 'mustang'} film={featuredProjects[alternate ? 1 : 0].media[0]} /> : <img key={previewImage} className="skills-frame-image" src={previewImage} onLoad={sampleAccent} alt={skill.id === 'web' ? `${webPreview.title} website preview` : mediaAlt({ src: previewImage, title: currentPhoto?.title || skill.projects[0].title })} />}
              <span className="skills-preview-cue">VIEW WORK <span aria-hidden="true">↗</span></span>
            </a>
            <span className="skills-media-label">{skill.id === 'web' ? webPreview.title : skill.id === 'film' ? `${alternate ? 'MANANG' : 'MUSTANG'} / TRAVEL FILM` : currentPhoto?.title || skill.projects[0].title}{photoFrames.length > 1 && <small>{String(photoFrame % photoFrames.length + 1).padStart(2, '0')} / {String(photoFrames.length).padStart(2, '0')}</small>}</span>
          </div>
          <div className="skills-showcase-copy">
            <div className="skills-bento-overview">
            <span className="skills-showcase-number">{String(active + 1).padStart(2, '0')} / 07</span>
            <h3>{skill.name}</h3>
            <p className="skills-showcase-summary">{skill.line}</p>
            <p className="skills-bento-context">{service.evidence}</p>
            <AnimatedButton className="skills-bento-explore" href={`/work/${skill.id}/`} size="lg">Explore {skill.name.toLowerCase()} <span aria-hidden="true">↗</span></AnimatedButton>
            </div>
            {supportingMedia ? <a className="skills-bento-photo" href={`/work/${skill.id}/#${supportingMedia.projectId}`}>
              <img src={supportingMedia.image} alt={mediaAlt({ ...supportingMedia, src: supportingMedia.image })} loading="lazy" />
              <span>{supportingMedia.title}<span aria-hidden="true">↗</span></span>
            </a> : <a className="skills-bento-photo skills-bento-photo--link" href={`/work/${skill.id}/`}><span aria-hidden="true">↗</span><span>View the projects</span></a>}
          </div>
          {canSwitch && <button type="button" className="skills-bento-preview" onClick={() => photoFrames.length > 1 ? setPhotoFrame(index => index + 1) : setAlternateSkill(alternate ? null : skill.id)} aria-label="Switch project preview">
            <img src={skill.id === 'film' ? featuredProjects[alternate ? 0 : 1].media[0].poster : otherImage} alt="" />
            <span>SWITCH PREVIEW <span aria-hidden="true">↔</span></span>
          </button>}
        </div>
        <div className="skills-showcase-bottom">
          <span className={`skills-auto-status${paused || reducedMotion ? ' skills-auto-status--paused' : ''}`}><i aria-hidden="true" />{reducedMotion ? 'Choose a skill to explore' : paused ? 'Auto switching paused' : 'Auto switching · press Pause to stop'}</span>
          <div className="skills-showcase-tabs" aria-label="Choose a discipline">{workSkills.map((item, index) => <button type="button" key={item.id} aria-pressed={active === index} onClick={() => selectSkill(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.name}</button>)}</div>
          <div className="skills-showcase-controls"><AnimatedButton variant="outline" size="icon" aria-label="Previous discipline" onClick={() => selectSkill(active - 1)}>←</AnimatedButton><AnimatedButton variant="outline" size="icon" aria-label="Next discipline" onClick={() => selectSkill(active + 1)}>→</AnimatedButton>{!reducedMotion && <AnimatedButton variant="ghost" size="sm" className="skills-showcase-pause" onClick={() => setPaused(!paused)} aria-label={paused ? 'Enable automatic switching' : 'Pause automatic switching'}>{paused ? 'PLAY' : 'PAUSE'}</AnimatedButton>}</div>
        </div>
      </div>
    </div>
  </section>;
}

function SkillPage({ skillId }) {
  const skill = workSkills.find((item) => item.id === skillId);
  const service = creativeServices.find((item) => item.id === skillId);
  const heroVideo = skillId === 'film' ? filmProjects[1].media[0] : skillId === 'motion' ? featuredProjects[2].media[0] : null;
  const heroVideoStart = skillId === 'film' ? 0 : 3;
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
      const routeOverlay = document.querySelector('.experience-route-stage[data-transition-active]');
      const delay = Boolean(routeOverlay) ? .48 : .05;
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
  const serviceContext = <section className="work-service-context" aria-label={`${service.name} by Aashish Mahato`}><div><h3>{service.name} by Aashish Mahato</h3><p>{service.description} Based in Kathmandu, Nepal.</p></div><div><h3>Project examples</h3><p>{service.evidence}</p><a href="/contact/">DISCUSS A PROJECT ↗</a></div></section>;
  return <div className={`inner-page skill-page skill-page--${skill.id}`}><SiteNav current="work" /><main>
    <section className="skill-hero" ref={heroRef} aria-labelledby="skill-title"><div className="skill-hero-image">{skill.slides ? skill.slides.map((src, index) => <img className="skill-hero-slide" src={src} alt="" loading={index === 0 ? "eager" : "lazy"} key={src} />) : <img src={skill.cover} alt="" />}{heroVideo && <video className={`skill-hero-video ${heroVideoReady ? 'is-ready' : ''}`} src={heroVideo.src} muted playsInline preload={heroVideoStart === 0 ? "auto" : "metadata"} poster={heroVideo.poster || skill.cover} aria-hidden="true" onLoadedData={(event) => { if (heroVideoStart !== 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const video = event.currentTarget; video.dataset.ready = 'true'; setHeroVideoReady(true); if (video.getBoundingClientRect().bottom > 0 && video.getBoundingClientRect().top < window.innerHeight) video.play().catch(() => {}); }} onLoadedMetadata={(event) => { const video = event.currentTarget; video.currentTime = video.duration > heroVideoStart + 2 ? heroVideoStart : Math.max(0, video.duration * .2); }} onSeeked={(event) => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const video = event.currentTarget; video.dataset.ready = 'true'; setHeroVideoReady(true); if (video.getBoundingClientRect().bottom > 0 && video.getBoundingClientRect().top < window.innerHeight) video.play().catch(() => {}); }} onEnded={(event) => { const video = event.currentTarget; video.currentTime = video.duration > heroVideoStart + 2 ? heroVideoStart : Math.max(0, video.duration * .2); }} />}</div><div className="skill-hero-shade" /><div className="skill-hero-content experience-shell"><div className="skill-hero-overline"><a href="/work/">← ALL SKILLS</a><span>{String(workSkills.indexOf(skill) + 1).padStart(2, '0')} / {String(workSkills.length).padStart(2, '0')}</span></div><div className="skill-hero-main"><span className="skill-hero-kicker">AASHISH MAHATO / MY WORK</span><MaskedHeroTitle text={skill.name} id="skill-title" /><p>{skill.line}</p></div><div className="skill-hero-bottom"><span>SELECTED PROJECTS BELOW</span><span>SCROLL ↓</span></div></div></section>
    <section className={`work-detail work-detail--${skill.id}`}><div className="experience-shell"><nav className="work-detail-switcher" aria-label="Explore other skills">{workSkills.map((item) => <a href={`/work/${item.id}/`} key={item.id} aria-current={skill.id === item.id ? 'page' : undefined}>{item.name}</a>)}</nav><div className="work-detail-heading" data-reveal><span>{skill.name} / SKILLS</span><h2>PROJECTS<i>.</i></h2><p>{skill.line}</p>{skill.id === 'branding' ? <p className="work-branding-support">A selection of identity designs and printed materials for CIC Nepal and Decora, including business cards, service booklets, and brand presentations.</p> : <div className="work-detail-capabilities" aria-label={`${skill.name} skills`}>{skill.capabilities.map((capability) => <span key={capability}>{capability}</span>)}</div>}</div>{skill.id !== 'branding' && serviceContext}<WorkMediaGallery skill={skill} key={skill.id} />{skill.id === 'web' && <div className="github-proof" data-reveal><div className="github-proof-heading"><div><span>PUBLIC GITHUB ACTIVITY / SEPTEMBER 2026 SNAPSHOT</span><h3>GITHUB <em>ACTIVITY.</em></h3><p>A snapshot of my GitHub contribution activity. Visit my profile for the latest projects and activity.</p></div><a href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer">VIEW GITHUB ↗</a></div><a className="github-proof-image" href="https://github.com/aashishmahato12" target="_blank" rel="noopener noreferrer" aria-label="View current GitHub contribution activity"><img src="/media/github-contributions-2026-09.png" alt="Screenshot of Aashish Mahato's GitHub contribution graph in September 2026" loading="lazy" /></a></div>}<div className="skill-page-end"><a href="/work/">← ALL SKILLS</a><a href="/gallery/">FULL GALLERY ↗</a></div>{skill.id === 'branding' && serviceContext}</div></section>
  </main><SiteFooter /></div>;
}

function GalleryPage() {
  const [filter, setFilter] = useState('all');
  const [photo, setPhoto] = useState(null);
  const pageRef = useRef(null);
  const gridRef = useRef(null);
  const lightboxRef = useRef(null);
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
        const routeOverlay = document.querySelector('.experience-route-stage[data-transition-active]');
        const delay = Boolean(routeOverlay) ? .55 : .08;
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
    if (!photo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(lightboxRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: .38, ease: 'power2.out' });
      gsap.fromTo('.gallery-lightbox img, .gallery-lightbox video', { scale: .9, y: 42 }, { scale: 1, y: 0, duration: .7, ease: 'power3.out' });
      gsap.from('.gallery-lightbox-meta', { autoAlpha: 0, y: 16, duration: .5, delay: .2 });
    }, lightboxRef);
    return () => context.revert();
  }, [photo]);

  const closePhoto = () => {
    const finish = () => { setPhoto(null); window.requestAnimationFrame(() => photoTriggerRef.current?.focus()); };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !lightboxRef.current) { finish(); return; }
    gsap.to(lightboxRef.current, { autoAlpha: 0, duration: .25, ease: 'power2.in', onComplete: finish });
  };

  useEffect(() => {
    if (!photo) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => lightboxRef.current?.querySelector('button')?.focus(), 60);
    const onEscape = (event) => {
      if (event.key === 'Escape') closePhoto();
      if (event.key === 'Tab') {
        const targets = [...lightboxRef.current.querySelectorAll('button, video[controls]')];
        const first = targets[0];
        const last = targets[targets.length - 1];
        if (!lightboxRef.current.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => { window.clearTimeout(focusTimer); window.removeEventListener('keydown', onEscape); document.body.style.overflow = previousOverflow; };
  }, [photo]);

  const changeFilter = (next) => setFilter(next);
  const allMedia = useMemo(() => {
    const combined = [...galleryMedia, ...featuredProjects.flatMap((project) => (project.media || []).map((item,index) => ({ ...item, id: item.id || `${project.id}-${index}`, title: item.title || project.title })))];
    return combined.filter((item, index) => combined.findIndex((other) => other.src === item.src) === index);
  }, []);
  const allPhotos = allMedia.filter((item) => item.type === 'photo');
  const items = useMemo(() => allMedia.filter((item) => filter === 'all' || (filter === 'video' && item.type === 'video') || (filter === 'photography' && item.category === 'Photography') || (filter === 'design' && item.type === 'photo' && item.category !== 'Photography')), [allMedia, filter]);

  return <div className="inner-page gallery-page" ref={pageRef}>
    <SiteNav current="gallery" />
    <main>
      <section className="inner-intro gallery-intro experience-shell"><SectionTop number="01" label="GALLERY" aside="WATCH / VIEW / EXPLORE" /><div className="signature-heading signature-page-title"><HandwrittenText className="signature-accent">Explore</HandwrittenText><GalleryLetterTitle /></div><p>Browse my films, photographs, brand designs, and graphic design projects.</p></section>
      <GalleryCinematic items={allMedia} />
      <section className="gallery-content experience-shell" id="gallery-library"><div className="gallery-library-heading"><span>PHOTOS / FILMS / DESIGN</span><h2>ALL <em>WORK.</em></h2><p>Open a photo, play a video, or filter by category.</p></div><div className="gallery-controls"><span aria-live="polite">{String(items.length).padStart(2, '0')} PIECES</span><div role="group" aria-label="Gallery filter">{[['all','ALL'],['video','FILMS'],['photography','PHOTOS'],['design','DESIGN']].map(([value,label])=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>changeFilter(value)}>{label}</button>)}</div></div><div ref={gridRef}><Masonry items={items} paused={Boolean(photo)} ease="power3.out" duration={.6} stagger={.05} animateFrom="bottom" hoverScale={.97} blurToFocus onOpen={(item, trigger) => { photoTriggerRef.current = trigger; setPhoto(item); }} /></div></section>
      <GalleryIsometricWave items={allMedia} paused={Boolean(photo)} onOpen={(item, trigger) => { photoTriggerRef.current = trigger; setPhoto(item); }} />
      <GalleryFinalGrid photos={allPhotos} />
    </main>
    <SiteFooter />
    {photo && <div className="gallery-lightbox" ref={lightboxRef} role="dialog" aria-modal="true" aria-label={photo.title} onMouseDown={(event)=>{if(event.target===event.currentTarget)closePhoto()}}><button type="button" onClick={closePhoto} aria-label="Close preview">CLOSE ×</button>{photo.type === 'video' ? <ReelVideo item={photo} controls /> : <img src={photo.src} alt={mediaAlt(photo)}/>}<div className="gallery-lightbox-meta"><span>{photo.category || 'VISUAL ARCHIVE'}</span><strong>{photo.title}</strong></div></div>}
  </div>;
}

function WorkTitle() {
  return <GalleryLetterTitle text="WORK" prefix="" className="work-gallery-title" />;
}

function WorkPage() {
  usePageMotion('work');
  return <div className="inner-page work-page"><SiteNav current="work" /><main><section className="inner-intro experience-shell"><SectionTop number="01" label="WORK" aside="SELECTED PROJECTS / KATHMANDU, NEPAL" /><div className="work-hero-layout"><div className="signature-heading signature-page-title"><HandwrittenText className="signature-accent">Selected</HandwrittenText><WorkTitle /></div><div className="work-hero-summary"><p>Film, photography, design, and web projects by Aashish Mahato.</p></div></div></section><ParallaxChapters className="work-parallax-skills" label="MY SKILLS" items={workSkills.map(skill => ({ title: `${skill.name}.`, line: skill.line, image: skill.cover, slides: skill.slides, video: skill.id === 'film' ? filmProjects[1].media[0] : skill.id === 'motion' ? featuredProjects[2].media[0] : null, id: `practice-${skill.id}`, href: `/work/${skill.id}/` }))} /><section className="work-service-context experience-shell"><div><h2>Browse the gallery</h2><p>Browse photographs, film frames, and design projects in the <a href="/gallery/">Gallery</a>, or <a href="/about/">read about me</a> and how I work.</p></div><div><h2>Have a project in mind?</h2><p><a href="/contact/">Contact Aashish Mahato</a> to discuss the scope and delivery plan.</p></div></section></main><SiteFooter /></div>;
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
  return <div className="inner-page contact-page"><SiteNav current="contact" /><main><section className="inner-intro experience-shell"><SectionTop number="01" label="CONTACT" aside="KATHMANDU, NEPAL" /><div className="signature-heading signature-page-title"><HandwrittenText className="signature-accent">Connect</HandwrittenText><h1>CONTACT ME<span>.</span></h1></div><p>Contact Aashish Mahato about film, photography, branding, graphic design, motion graphics, and web projects.</p></section><section className="contact-content experience-shell" aria-labelledby="contact-options-title"><div><span className="experience-eyebrow">CONTACT / PROJECT ENQUIRIES</span><h2 id="contact-options-title">Send me a message.</h2><p>I’m based in Kathmandu, Nepal. Send me a message through Instagram or LinkedIn with what you want to make, who it’s for, and your timeline.</p><div className="contact-profile-links">{officialProfiles.filter(profile => ['Instagram', 'LinkedIn'].includes(profile.label)).map(profile => <a className="experience-text-link" href={profile.url} key={profile.url} target="_blank" rel="noopener noreferrer">Message Aashish on {profile.label} ↗</a>)}</div></div><div><h2>What to include</h2><ul><li>What you need: a film, photographs, a visual identity, graphics, or a website.</li><li>Your audience, project scope, timeline, and budget.</li><li>Examples or references that explain your direction.</li></ul><p>Explore my <a href="/work/">Work</a>, browse the <a href="/gallery/">Gallery</a>, or read <a href="/about/">About me</a> before getting in touch.</p></div></section><HomeTestimonials number="02" /></main><SiteFooter /></div>;
}

function PrivacyPage() {
  return <div className="inner-page privacy-page"><SiteNav current="privacy" /><main className="experience-shell"><section className="inner-intro"><SectionTop number="01" label="PRIVACY" aside={`UPDATED / ${privacyUpdated.toUpperCase()}`} /><h1>Privacy<span>.</span></h1><p>How this portfolio handles information.</p></section><div className="privacy-content">{privacySections.map(section => <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}<section><h2>Contact and provider policies</h2><p>For privacy questions, <a href="/contact/">contact Aashish</a> through his official profiles.</p><ul>{privacyProviders.map(provider => <li key={provider.url}><a href={provider.url} target="_blank" rel="noopener noreferrer">{provider.label} ↗</a></li>)}</ul></section></div></main><SiteFooter /></div>;
}

function AboutPage() {
  return <div className="inner-page about-page"><SiteNav current="about" /><main><AboutOpening /><AboutTimeline /><AboutAfterTimeline /><HomeTestimonials number="06" /></main><SiteFooter /></div>;
}

export default function Experience() {
  const [route, setRoute] = useState(() => routeFor(window.location.pathname));
  useEffect(() => { updateSearchMeta(route); }, [route]);
  const current = useRef(route);
  const stageRef = useRef(null);
  const routePageRef = useRef(null);
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
    let transition;
    let previousOverflow;
    const moveTo = (url, push) => {
      const next = routeFor(url.pathname);
      if (next === current.current) { if (push) window.history.pushState({}, '', url); return; }
      if (inTransition.current) return;
      inTransition.current = true;
      const stage = stageRef.current;
      const page = routePageRef.current;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const swap = () => {
        if (push) window.history.pushState({}, '', url);
        current.current = next;
        flushSync(() => setRoute(next));
        updateSearchMeta(next);
        if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true, force: true });
        else window.scrollTo(0, 0);
      };
      const finish = () => {
        gsap.set([stage, page], { clearProps: 'all' });
        delete stage.dataset.transitionActive;
        if (previousOverflow !== undefined) { document.body.style.overflow = previousOverflow; previousOverflow = undefined; }
        lenisRef.current?.start();
        window.requestAnimationFrame(() => {
          if (url.hash) {
            const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
            if (target && lenisRef.current) lenisRef.current.scrollTo(target, { immediate: true, force: true });
            else target?.scrollIntoView();
          }
          ScrollTrigger.refresh();
        });
        inTransition.current = false;
        if (routeFor(window.location.pathname) !== current.current) moveTo(new URL(window.location.href), false);
      };
      if (reducedMotion) { swap(); finish(); return; }
      const scrollTop = window.scrollY;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      lenisRef.current?.stop();
      stage.dataset.transitionActive = 'true';
      gsap.set(stage, { position: 'fixed', inset: 0, height: '100svh', overflow: 'hidden', zIndex: 99, pointerEvents: 'none' });
      gsap.set(page, { y: -scrollTop, transformOrigin: `50% ${scrollTop + window.innerHeight / 2}px`, willChange: 'transform,opacity' });
      transition = gsap.timeline({ onComplete: finish })
        .to(page, { y: -scrollTop - 18, scale: .99, autoAlpha: 0, duration: .24, ease: 'power2.inOut' })
        .call(swap)
        .set(page, { y: 42, scale: .985, autoAlpha: 0, transformOrigin: `50% ${window.innerHeight / 2}px` })
        .to(page, { y: 0, scale: 1, autoAlpha: 1, duration: .7, ease: 'power3.out' });
    };
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const link = event.target.closest('a[href]');
      if (!link || link.target && link.target !== '_self' || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !(/^\/work\/(?:film|photography|motion|branding|graphic|digital|web)\/$/.test(url.pathname) || ['/','/work/','/gallery/','/about/','/contact/','/privacy/'].includes(url.pathname)) || routeFor(url.pathname) === current.current) return;
      event.preventDefault();
      moveTo(url, true);
    };
    const onPop = () => moveTo(new URL(window.location.href), false);
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPop);
    return () => { transition?.kill(); document.removeEventListener('click', onClick); window.removeEventListener('popstate', onPop); if (previousOverflow !== undefined) document.body.style.overflow = previousOverflow; };
  }, []);

  const Page = route.startsWith('skill-') ? SkillPage : { home: Home, work: WorkPage, gallery: GalleryPage, about: AboutPage, contact: ContactPage, privacy: PrivacyPage }[route];
  return <div className="experience-route-stage" ref={stageRef}><div className="experience-route-page" ref={routePageRef}><Suspense fallback={<div role="status" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#111111', color: '#ffffff' }}>Opening {route === 'gallery' ? 'gallery' : 'about'}…</div>}><div key={route}><Page skillId={route.startsWith('skill-') ? route.slice(6) : undefined} lenisRef={lenisRef} /></div></Suspense></div></div>;
}
