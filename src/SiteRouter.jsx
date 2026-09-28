import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const pageFor = (pathname) => pathname.startsWith('/projects') ? 'projects' : 'home';

export default function SiteRouter({ home, projects }) {
  const [page, setPage] = useState(() => pageFor(window.location.pathname));
  const pageRef = useRef(page);
  const overlayRef = useRef(null);
  const movingRef = useRef(false);

  useEffect(() => {
    document.title = pageRef.current === 'projects' ? 'Projects & Gallery — Aashish Mahato' : 'Aashish Mahato — Creative Portfolio';

    const finishAt = (url) => {
      window.scrollTo(0, 0);
      if (url.hash) {
        window.requestAnimationFrame(() => {
          document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
          ScrollTrigger.refresh();
        });
      } else {
        window.requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    };

    const navigate = (url, push) => {
      const nextPage = pageFor(url.pathname);
      if (nextPage === pageRef.current) {
        if (push) window.history.pushState({}, '', url);
        finishAt(url);
        return;
      }
      if (movingRef.current) return;
      movingRef.current = true;
      const overlay = overlayRef.current;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const swap = () => {
        if (push) window.history.pushState({}, '', url);
        pageRef.current = nextPage;
        flushSync(() => setPage(nextPage));
        document.title = nextPage === 'projects' ? 'Projects & Gallery — Aashish Mahato' : 'Aashish Mahato — Creative Portfolio';
        finishAt(url);
      };
      const finish = () => {
        gsap.set(overlay, { clearProps: 'all' });
        document.body.style.overflow = previousOverflow;
        movingRef.current = false;
      };

      if (reduced) {
        swap();
        finish();
        return;
      }

      gsap.timeline({ onComplete: finish })
        .set(overlay, { display: 'flex', yPercent: 101, pointerEvents: 'auto' })
        .to(overlay, { yPercent: 0, duration: .55, ease: 'power4.inOut' })
        .call(swap)
        .to(overlay, { yPercent: -101, duration: .7, ease: 'power4.inOut' }, '+=.12');
    };

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest('a[href]');
      if (!anchor || anchor.hasAttribute('download') || anchor.target && anchor.target !== '_self') return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !['/', '/projects/', '/projects'].includes(url.pathname)) return;
      if (pageFor(url.pathname) === pageRef.current) return;
      event.preventDefault();
      navigate(url, true);
    };
    const onPopState = () => navigate(new URL(window.location.href), false);

    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  return <><div key={page}>{page === 'projects' ? projects : home}</div><div className="route-transition" ref={overlayRef} aria-hidden="true"><span>A/M<span>®</span></span><i /><small>IDEAS IN MOTION</small></div></>;
}
