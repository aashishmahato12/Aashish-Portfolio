import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PortfolioIcon } from './PortfolioIcons.jsx';
import RubberSegment from './RubberSegment.jsx';
import GradientBlinds from './GradientBlinds.jsx';
import GlassSurface from './components/GlassSurface.jsx';
import { officialProfiles } from './seo-data.js';

const pages = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'work', label: 'Work', href: '/work/' },
  { id: 'gallery', label: 'Gallery', href: '/gallery/' },
  { id: 'about', label: 'About', href: '/about/' },
  { id: 'contact', label: 'Contact', href: '/contact/' },
];

export function SiteHeader({ current }) {
  return <header className={`inner-nav creative-header${current === 'home' ? '' : ' creative-header--solid'}`}>
    <a className="header-identity" href="/" aria-label="Aashish Mahato home"><span className="inner-logo">A/M<span>®</span></span><span className="header-name">Aashish Mahato<small>Film, design & web · Kathmandu</small></span></a>
    <nav className={current === 'home' ? undefined : 'header-plain-nav'} aria-label="Main navigation">
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
  </header>;
}

export function SiteFooter() {
  return <footer className="experience-footer creative-end-footer creative-end-footer--blinds">
    <div className="creative-end-background" aria-hidden="true"><GradientBlinds
      gradientColors={['#6b00ff', '#ff0000', '#F97316']}
      angle={20} blindCount={10} blindMinWidth={60} spotlightRadius={.5}
      shine={.37} relief={.14} glow={.73} sway={.35} hoverTilt={.55}
      clickEffect="ripple" noise={.3} spotlightSoftness={1.15} speed={1.55}
      gradientSpeed={1.5} distortAmount={6} intro={false}
    /></div>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&display=swap" />
    <div className="creative-end-top"><span>AASHISH MAHATO / PORTFOLIO</span><span>KATHMANDU, NEPAL</span></div>
    <div className="creative-end-main">
      <a className="creative-end-contact" href="/contact/"><span>HAVE A PROJECT IN MIND?</span><strong>LET’S<br />TALK<span className="creative-end-period">.</span></strong><div className="creative-end-arrow creative-end-arrow--liquid" aria-hidden="true"><GlassSurface width="100%" height="100%" borderRadius={999} borderWidth={.12} brightness={60} opacity={.85} blur={12} displace={3} backgroundOpacity={.12} saturation={1.15} distortionScale={-100} redOffset={0} greenOffset={3} blueOffset={6}><ArrowUpRight strokeWidth={1.6} /></GlassSurface></div></a>
      <div className="creative-end-directory"><nav aria-label="Footer navigation"><span>EXPLORE</span>{pages.map(page => <a key={page.id} href={page.href}><span className="footer-link-label"><PortfolioIcon kind="page" name={page.id} animated />{page.label}</span></a>)}</nav><nav className="footer-social-nav" aria-label="Social profiles"><span>FIND ME ONLINE</span>{officialProfiles.map(profile => <a key={profile.url} href={profile.url} aria-label={profile.label} title={profile.label} target="_blank" rel="noopener noreferrer"><span className="footer-link-label"><span className="footer-social-glass" aria-hidden="true"><GlassSurface width="100%" height="100%" borderRadius={999} borderWidth={.12} brightness={60} opacity={.85} blur={12} displace={3} backgroundOpacity={.1} saturation={1.1} distortionScale={-65} redOffset={0} greenOffset={2} blueOffset={4}><PortfolioIcon kind="social" name={profile.label} animated /></GlassSurface></span><PortfolioIcon className="footer-social-desktop-icon" kind="social" name={profile.label} animated /><span className="footer-social-name">{profile.label}</span></span></a>)}</nav></div>
    </div>
    <div className="creative-end-bottom"><span>© {new Date().getFullYear()} AASHISH MAHATO</span><span>FILM / PHOTOGRAPHY / DESIGN / WEB</span><a href="/privacy/">Privacy</a></div>
  </footer>;
}
