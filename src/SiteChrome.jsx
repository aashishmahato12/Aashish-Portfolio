import React from 'react';

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
  return <footer className="experience-footer">
    <a href="/" className="footer-logo" aria-label="Aashish Mahato home">A/M<span>®</span></a>
    <p>FILM · PHOTOGRAPHY · DESIGN · WEB</p>
    <nav className="footer-pages" aria-label="Footer navigation">
      <a href="/privacy/">Privacy</a>
      {pages.map(page => <a key={page.id} href={page.href}>{page.label}</a>)}
    </nav>
    <span>© 2026 AASHISH MAHATO</span>
  </footer>;
}
