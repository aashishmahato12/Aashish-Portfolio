import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { collaborators, previewCompanies } from './portfolio-data.js';
import './company-marquee.css';

function CompanyMark({ company }) {
  const content = company.logo
    ? <img src={company.logo} alt={company.name} loading="lazy" />
    : <span>{company.name}</span>;

  return (
    <div className={`company-mark ${company.placeholder ? 'is-placeholder' : ''}`}>
      {company.href && !company.placeholder ? <a href={company.href} target="_blank" rel="noopener noreferrer">{content}</a> : content}
      {company.placeholder && <small>LOGO PLACEHOLDER</small>}
    </div>
  );
}

export default function CompanyMarquee({ dark = false }) {
  const rootRef = useRef(null);
  const companies = collaborators.length ? collaborators : previewCompanies;
  const rows = [companies, [...companies].reverse()];

  useLayoutEffect(() => {
    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const root = rootRef.current;
      let pause;
      let resume;
      const context = gsap.context(() => {
        const tracks = root.querySelectorAll('.company-marquee-track');
        const loops = [...tracks].map((track, index) => gsap.fromTo(track,
          { xPercent: index === 0 ? 0 : -50 },
          { xPercent: index === 0 ? -50 : 0, duration: index === 0 ? 38 : 44, ease: 'none', repeat: -1 }));
        pause = () => loops.forEach((loop) => loop.pause());
        resume = () => loops.forEach((loop) => loop.resume());
        root.addEventListener('pointerenter', pause);
        root.addEventListener('pointerleave', resume);
      }, root);

      return () => {
        root.removeEventListener('pointerenter', pause);
        root.removeEventListener('pointerleave', resume);
        context.revert();
      };
    });

    return () => motion.revert();
  }, []);

  return (
    <div className={`company-marquee ${dark ? 'company-marquee--dark' : ''}`} ref={rootRef} aria-label="Company marks">
      {rows.map((row, rowIndex) => (
        <div className="company-marquee-row" key={rowIndex} aria-hidden={rowIndex === 1}>
          <div className="company-marquee-track">
            {[0, 1].map((copy) => (
              <div className="company-marquee-group" key={copy} aria-hidden={copy === 1}>
                {row.map((company, index) => <CompanyMark company={company} key={`${company.name}-${index}`} />)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
