import React from 'react';

const pages = [
  { id: 'work', label: 'Work', href: '/work/' },
  { id: 'gallery', label: 'Gallery', href: '/gallery/' },
  { id: 'about', label: 'About', href: '/about/' },
  { id: 'contact', label: 'Contact', href: '/contact/' },
];

export function SiteHeader({ current }) {
  return <header className="inner-nav">
    <a className="inner-logo" href="/" aria-label="Aashish Mahato home">A/M<span>®</span></a>
    <nav aria-label="Main navigation">
      {pages.map(page => <a key={page.id} href={page.href} aria-current={current === page.id ? 'page' : undefined}>{page.label}</a>)}
    </nav>
  </header>;
}

export function SiteFooter() {
  return <footer className="experience-footer">
    <a href="/" className="footer-logo" aria-label="Aashish Mahato home">A/M<span>®</span></a>
    <p>IMAGE · MOTION · DESIGN · CODE</p>
    <nav className="footer-pages" aria-label="Footer navigation">
      {pages.map(page => <a key={page.id} href={page.href}>{page.label}</a>)}
    </nav>
    <span>© 2026 AASHISH MAHATO</span>
  </footer>;
}
