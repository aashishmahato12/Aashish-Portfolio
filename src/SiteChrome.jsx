import React, { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { PortfolioIcon } from './PortfolioIcons.jsx';
import RubberSegment from './RubberSegment.jsx';
const GradientBlinds = React.lazy(() => import('./GradientBlinds.jsx'));
import GlassSurface from './components/GlassSurface.jsx';
import { officialProfiles } from './seo-data.js';

const MenuVeil = React.lazy(() => import('./components/DarkVeil.jsx'));

const pages = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'work', label: 'Work', href: '/work/' },
  { id: 'gallery', label: 'Gallery', href: '/gallery/' },
  { id: 'about', label: 'About', href: '/about/' },
  { id: 'contact', label: 'Contact', href: '/contact/' },
];

export function SiteHeader({ current }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const layerRef = useRef(null);
  const panelRef = useRef(null);
  const backdropRef = useRef(null);
  const menuTween = useRef(null);
  const hasOpened = useRef(false);
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.set(layerRef.current, { autoAlpha: 0 });
      gsap.set(panelRef.current, { xPercent: 100 });
      gsap.set(layerRef.current.querySelectorAll('.mobile-menu-curtain'), { xPercent: 100 });
      gsap.set(backdropRef.current, { opacity: 0 });
    });
    return () => { menuTween.current?.kill(); context.revert(); };
  }, []);
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    menuTween.current?.kill();
    const timeline = gsap.timeline({ defaults: { ease: 'sine.inOut' } });
    menuTween.current = timeline;
    const curtains = [layerRef.current.querySelector('.mobile-menu-curtain--red'), layerRef.current.querySelector('.mobile-menu-curtain--charcoal'), panelRef.current];
    if (menuOpen) {
      hasOpened.current = true;
      gsap.set(layerRef.current, { autoAlpha: 1 });
      // Reset each text group on every opening, including interrupted openings.
      gsap.set(panelRef.current.querySelectorAll('.mobile-menu-top,.mobile-menu-eyebrow'), { y: reduce ? 0 : 10, opacity: 0 });
      gsap.set(panelRef.current.querySelectorAll('.mobile-menu-page'), { x: reduce ? 0 : 16, opacity: 0 });
      gsap.set(panelRef.current.querySelectorAll('.mobile-menu-bottom>*'), { y: reduce ? 0 : 12, opacity: 0 });
      timeline.to(backdropRef.current, { opacity: 1, duration: reduce ? 0 : .3 }, 0)
        .to(curtains, { xPercent: 0, duration: reduce ? 0 : .32, stagger: reduce ? 0 : .045 }, 0)
        .to(panelRef.current.querySelectorAll('.mobile-menu-top,.mobile-menu-eyebrow'), { y: 0, opacity: 1, duration: reduce ? 0 : .3, stagger: reduce ? 0 : .055 }, reduce ? 0 : .2)
        .to(panelRef.current.querySelectorAll('.mobile-menu-page'), { x: 0, opacity: 1, duration: reduce ? 0 : .3, stagger: reduce ? 0 : .055 }, reduce ? 0 : .25)
        .to(panelRef.current.querySelectorAll('.mobile-menu-bottom>*'), { y: 0, opacity: 1, duration: reduce ? 0 : .3, stagger: reduce ? 0 : .05 }, reduce ? 0 : .55)
        .call(() => panelRef.current?.querySelector('.mobile-menu-close')?.focus({ preventScroll: true }), null, reduce ? 0 : .43);
    } else {
      timeline.to([...curtains].reverse(), { xPercent: 100, duration: reduce ? 0 : .3, stagger: reduce ? 0 : .04 }, 0)
        .to(backdropRef.current, { opacity: 0, duration: reduce ? 0 : .35 }, reduce ? 0 : .05)
        .set(layerRef.current, { autoAlpha: 0 })
        .call(() => { if (hasOpened.current) menuButtonRef.current?.focus({ preventScroll: true }); });
    }
  }, [menuOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    document.body.classList.add('mobile-menu-lock');
    const closeOnResize = () => { if (window.innerWidth > 700) setMenuOpen(false); };
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); setMenuOpen(false); }
      if (event.key !== 'Tab') return;
      const nodes = [...panelRef.current.querySelectorAll('a[href],button')];
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panelRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    window.addEventListener('resize', closeOnResize);
    return () => { document.body.classList.remove('mobile-menu-lock'); document.removeEventListener('keydown', keydown); window.removeEventListener('resize', closeOnResize); };
  }, [menuOpen]);
  return <><header className={`inner-nav creative-header${current === 'home' ? '' : ' creative-header--solid'}`}>
    <a className="header-identity" href="/" aria-label="Aashish Mahato home"><span className="inner-logo">A/M<span>®</span></span><span className="header-name">Aashish Mahato<small>Film, design & web · Kathmandu</small></span></a>
    <nav className={current === 'home' ? 'header-desktop-nav' : 'header-plain-nav header-desktop-nav'} aria-label="Main navigation">
      {current === 'home' ? <RubberSegment
        items={pages.map(page => ({ value: page.id, href: page.href, ariaLabel: page.label, label: <><PortfolioIcon kind="page" name={page.id} size={15} />{page.label}</> }))}
        value={current}
        trackColor="transparent"
        thumbColor={current === 'contact' ? '#e34530' : '#fff'}
        activeTextColor={current === 'contact' ? '#fff' : '#111'}
        size="lg" radius={40} inset={4} equalSlots={false} draggable={false}
        aria-label="Main navigation"
      /> : pages.map(page => <a className="header-plain-link" key={page.id} href={page.href} aria-current={current === page.id ? 'page' : undefined}><PortfolioIcon kind="page" name={page.id} size={15} />{page.label}</a>)}
    </nav>
    <button ref={menuButtonRef} className="mobile-menu-trigger" type="button" aria-label="Open navigation menu" aria-expanded={menuOpen} aria-controls="mobile-navigation-panel" onClick={() => setMenuOpen(true)}><Menu size={24} strokeWidth={1.6} /></button>
  </header>{createPortal(<div ref={layerRef} className="mobile-menu-layer" aria-hidden={!menuOpen} data-lenis-prevent="">
    <button ref={backdropRef} className="mobile-menu-backdrop" tabIndex={-1} aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />
    <div className="mobile-menu-curtain mobile-menu-curtain--red" aria-hidden="true" /><div className="mobile-menu-curtain mobile-menu-curtain--charcoal" aria-hidden="true" />
    <div ref={panelRef} className="mobile-menu-panel" id="mobile-navigation-panel" role="dialog" aria-modal={menuOpen || undefined} aria-label="Navigation menu" inert={!menuOpen}>
      <div className="mobile-menu-art" aria-hidden="true">{(menuOpen || hasOpened.current) && <Suspense fallback={null}><MenuVeil color="#E34530" speed={.2} scale={1.25} flow={.4} warp={0} sheen={.1} glow={.15} grain={.015} quality={.35} mouseInteraction={false} intro={false} paused={!menuOpen} dpr={1} /></Suspense>}</div>
      <div className="mobile-menu-top"><span className="mobile-menu-brand">A/M<span>®</span></span><button className="mobile-menu-close" type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)}><X size={24} strokeWidth={1.6} /></button></div>
      <p className="mobile-menu-eyebrow">EXPLORE THE PORTFOLIO</p>
      <nav aria-label="Mobile navigation">{pages.map(page => <a className="mobile-menu-page" key={page.id} href={page.href} aria-current={current === page.id ? 'page' : undefined} onClick={() => setMenuOpen(false)}><PortfolioIcon kind="page" name={page.id} size={24} /><span>{page.label}</span></a>)}</nav>
      <div className="mobile-menu-bottom"><span>KATHMANDU, NEPAL</span><div>{officialProfiles.map(profile => <a key={profile.url} href={profile.url} aria-label={profile.label} target="_blank" rel="noopener noreferrer"><GlassSurface className="social-glass-circle" refraction={false} width={44} height={44} borderRadius={999} borderWidth={.12} brightness={60} opacity={.85} blur={12} displace={3} backgroundOpacity={.1} saturation={1.1} distortionScale={-65} redOffset={0} greenOffset={2} blueOffset={4}><PortfolioIcon kind="social" name={profile.label} size={20} /></GlassSurface></a>)}</div><small>Film · Photography · Design · Web</small></div>
    </div>
  </div>, document.body)}</>;

}

export function SiteFooter() {
  const footerRef = useRef(null);
  const [showBackground, setShowBackground] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShowBackground(true); observer.disconnect(); }
    }, { rootMargin: '600px' });
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);
  return <footer ref={footerRef} className="experience-footer creative-end-footer creative-end-footer--blinds">
    <div className="creative-end-background" aria-hidden="true">{showBackground && <Suspense fallback={null}><GradientBlinds
      gradientColors={['#6b00ff', '#ff0000', '#F97316']}
      angle={20} blindCount={10} blindMinWidth={60} spotlightRadius={.5}
      shine={.37} relief={.14} glow={.73} sway={.35} hoverTilt={.55}
      clickEffect="ripple" noise={.3} spotlightSoftness={1.15} speed={1.55}
      gradientSpeed={1.5} distortAmount={6} intro={false}
    /></Suspense>}</div>
    <div className="creative-end-main">
      <a className="creative-end-contact" href="/contact/"><span>HAVE A PROJECT IN MIND?</span><strong>LET’S<br />TALK<span className="creative-end-period">.</span></strong><div className="creative-end-arrow creative-end-arrow--liquid" aria-hidden="true"><GlassSurface width="100%" height="100%" borderRadius={999} borderWidth={.12} brightness={60} opacity={.85} blur={12} displace={3} backgroundOpacity={.12} saturation={1.15} distortionScale={-100} redOffset={0} greenOffset={3} blueOffset={6}><ArrowUpRight strokeWidth={1.6} /></GlassSurface></div></a>
      <div className="creative-end-directory"><nav aria-label="Footer navigation"><span>EXPLORE</span>{pages.map(page => <a key={page.id} href={page.href}><span className="footer-link-label"><PortfolioIcon kind="page" name={page.id} animated />{page.label}</span></a>)}</nav><nav className="footer-social-nav" aria-label="Social profiles"><span>FIND ME ONLINE</span>{officialProfiles.map(profile => <a key={profile.url} href={profile.url} aria-label={profile.label} title={profile.label} target="_blank" rel="noopener noreferrer"><span className="footer-link-label"><span className="footer-social-glass" aria-hidden="true"><GlassSurface className="social-glass-circle" refraction={false} width="100%" height="100%" borderRadius={999} borderWidth={.12} brightness={60} opacity={.85} blur={12} displace={3} backgroundOpacity={.1} saturation={1.1} distortionScale={-65} redOffset={0} greenOffset={2} blueOffset={4}><PortfolioIcon kind="social" name={profile.label} animated /></GlassSurface></span><PortfolioIcon className="footer-social-desktop-icon" kind="social" name={profile.label} animated /><span className="footer-social-name">{profile.label}</span></span></a>)}</nav></div>
    </div>
    <div className="creative-end-bottom"><span>© {new Date().getFullYear()} AASHISH MAHATO</span><span>FILM / PHOTOGRAPHY / DESIGN / WEB</span><a href="/privacy/">Privacy</a></div>
  </footer>;
}
