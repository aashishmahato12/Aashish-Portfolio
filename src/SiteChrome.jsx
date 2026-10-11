import React from 'react';
import { officialProfiles } from './seo-data.js';

const pages = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'work', label: 'Work', href: '/work/' },
  { id: 'gallery', label: 'Gallery', href: '/gallery/' },
  { id: 'about', label: 'About', href: '/about/' },
  { id: 'contact', label: 'Contact', href: '/contact/' },
];

export function SiteHeader({ current }) {
  return <header className="inner-nav creative-header">
    <a className="header-identity" href="/" aria-label="Aashish Mahato home"><span className="inner-logo">A/M<span>®</span></span><span className="header-name">Aashish Mahato<small>Film, design & web · Kathmandu</small></span></a>
    <nav aria-label="Main navigation">
      {pages.map(page => <a className={page.id === 'contact' ? 'header-contact' : 'header-page'} key={page.id} href={page.href} aria-current={current === page.id ? 'page' : undefined}><span>{page.label}</span>{page.id === 'contact' && <span className="header-arrow" aria-hidden="true">↗</span>}</a>)}
    </nav>
  </header>;
}

export function SiteFooter() {
  return <footer className="experience-footer bento-footer">
    <div className="footer-bento-grid">
      <a href="/contact/" className="footer-tile footer-contact-tile"><span className="footer-tile-label">HAVE A PROJECT IN MIND?</span><strong>Let’s talk<span aria-hidden="true">↗</span></strong><p>Film, photography, design, and web.</p></a>
      <a href="/" className="footer-tile footer-brand-tile" aria-label="Aashish Mahato home"><span className="footer-logo">A/M<span>®</span></span><span>Aashish Mahato</span></a>
      <nav className="footer-tile footer-nav-tile" aria-label="Footer navigation"><span className="footer-tile-label">EXPLORE</span>{pages.map(page => <a key={page.id} href={page.href}>{page.label}<span aria-hidden="true">↗</span></a>)}</nav>
      <a className="footer-tile footer-work-tile" href="/work/"><span className="footer-tile-label">THE PORTFOLIO</span><strong>View my<br />work.</strong><span className="footer-big-arrow" aria-hidden="true">↗</span></a>
      <nav className="footer-tile footer-social-tile" aria-label="Social profiles"><span className="footer-tile-label">FIND ME ONLINE</span>{officialProfiles.map(profile => <a key={profile.url} href={profile.url} target="_blank" rel="noopener noreferrer">{profile.label}<span aria-hidden="true">↗</span></a>)}</nav>
      <div className="footer-tile footer-location-tile"><span className="footer-tile-label">BASED IN</span><strong>Kathmandu,<br />Nepal.</strong></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} AASHISH MAHATO</span><a href="/privacy/">Privacy</a></div>
  </footer>;
}
