import React from 'react';
import RubberSegment from './RubberSegment.jsx';
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
      <RubberSegment
        items={pages.map(page => ({ value: page.id, href: page.href, label: <>{page.label}{page.id === 'contact' && <span className="header-arrow" aria-hidden="true">↗</span>}</> }))}
        value={current}
        trackColor="transparent"
        thumbColor={current === 'contact' ? '#e34530' : '#fff'}
        activeTextColor={current === 'contact' ? '#fff' : '#111'}
        size="lg" radius={40} inset={4} equalSlots={false} draggable={false}
        aria-label="Main navigation"
      />
    </nav>
  </header>;
}

export function SiteFooter() {
  return <footer className="experience-footer creative-end-footer">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&display=swap" />
    <div className="creative-end-top"><span>AASHISH MAHATO / PORTFOLIO</span><span>KATHMANDU, NEPAL</span></div>
    <div className="creative-end-main">
      <a className="creative-end-contact" href="/contact/"><span>HAVE A PROJECT IN MIND?</span><strong>LET’S<br />TALK<span className="creative-end-period">.</span></strong><span className="creative-end-arrow" aria-hidden="true">↗</span></a>
      <div className="creative-end-directory"><nav aria-label="Footer navigation"><span>EXPLORE</span>{pages.map(page => <a key={page.id} href={page.href}>{page.label}<span aria-hidden="true">↗</span></a>)}</nav><nav aria-label="Social profiles"><span>FIND ME ONLINE</span>{officialProfiles.map(profile => <a key={profile.url} href={profile.url} target="_blank" rel="noopener noreferrer">{profile.label}<span aria-hidden="true">↗</span></a>)}</nav></div>
    </div>
    <a className="creative-end-name" href="/" aria-label="Aashish Mahato home">AASHISH MAHATO</a>
    <div className="creative-end-bottom"><span>© {new Date().getFullYear()} AASHISH MAHATO</span><span>FILM / PHOTOGRAPHY / DESIGN / WEB</span><a href="/privacy/">Privacy</a></div>
  </footer>;
}
