// Adapted from the React Bits Masonry source supplied for this project.
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mediaAlt } from './media-text.js';
import './Masonry.css';

gsap.registerPlugin(ScrollTrigger);

export default function Masonry({ items, onOpen, paused = false, autoplayVideos = false, renderVisual, renderDetails, maxColumns = 5, ease = 'power3.out', duration = .6,
  stagger = .05, animateFrom = 'bottom', scaleOnHover = true, hoverScale = .97,
  blurToFocus = true, colorShiftOnHover = false }) {
  const containerRef = useRef(null);
  const previousGrid = useRef(new Map());
  const [width, setWidth] = useState(0);
  const [ratios, setRatios] = useState({});
  const [detailHeights, setDetailHeights] = useState({});
  const [reducedMotion, setReducedMotion] = useState(false);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(containerRef.current);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => { observer.disconnect(); preference.removeEventListener('change', update); };
  }, []);

  const columns = Math.min(maxColumns, items.length || 1, width >= 1300 ? 5 : width >= 950 ? 4 : width >= 650 ? 3 : width >= 360 ? 2 : 1);
  useLayoutEffect(() => {
    if (!renderDetails || !width) return;
    const observer = new ResizeObserver(entries => {
      setDetailHeights(current => {
        const next = { ...current };
        let changed = false;
        entries.forEach(({ target }) => {
          const id = target.dataset.mediaId;
          const height = Math.ceil(target.getBoundingClientRect().height);
          if (height !== current[id]) { next[id] = height; changed = true; }
        });
        return changed ? next : current;
      });
    });
    containerRef.current.querySelectorAll('.masonry-details').forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [items, width, renderDetails]);
  const { grid, height } = useMemo(() => {
    if (!width) return { grid: [], height: 0 };
    const gap = 14;
    const columnWidth = (width - gap * (columns - 1)) / columns;
    const heights = Array(columns).fill(0);
    const grid = items.map(item => {
      const column = heights.indexOf(Math.min(...heights));
      const ratio = ratios[item.id] || item.aspectRatio || (item.type === 'video' ? 16 / 9 : 1);
      const mediaHeight = columnWidth / ratio;
      const tile = { ...item, x: column * (columnWidth + gap), y: heights[column], w: columnWidth, h: mediaHeight + (renderDetails ? detailHeights[item.id] || 150 : 66), mediaHeight };
      heights[column] += tile.h + gap;
      return tile;
    });
    return { grid, height: Math.max(0, ...heights) - (items.length ? gap : 0) };
  }, [items, ratios, detailHeights, renderDetails, width, columns]);

  const measureMedia = (item, media) => {
    if (item.aspectRatio) return;
    const naturalWidth = media.naturalWidth || media.videoWidth;
    const naturalHeight = media.naturalHeight || media.videoHeight;
    if (!naturalWidth || !naturalHeight) return;
    const ratio = naturalWidth / naturalHeight;
    setRatios(current => current[item.id] === ratio ? current : { ...current, [item.id]: ratio });
  };

  useLayoutEffect(() => {
    if (!width) return;
    const context = gsap.context(() => {
      const nodes = [...containerRef.current.querySelectorAll('.masonry-item')];
      grid.forEach((item, index) => {
        const node = nodes[index];
        const previous = previousGrid.current.get(item.id);
        if (reducedMotion) return;
        if (previous) {
          gsap.fromTo(node, { left: previous.x, top: previous.y }, {
            left: item.x, top: item.y, duration, ease, overwrite: 'auto',
          });
        } else {
          const initial = animateFrom === 'top' ? { y: -50 } : animateFrom === 'left' ? { x: -50 }
            : animateFrom === 'right' ? { x: 50 } : { y: 50 };
          gsap.fromTo(node.querySelector('.masonry-tile'), {
            ...initial, opacity: 0, ...(blurToFocus && { filter: 'blur(8px)' }),
          }, {
            x: 0, y: 0, opacity: 1, filter: 'blur(0px)', duration, ease,
            delay: index % columns * stagger,
            scrollTrigger: { trigger: node, start: 'top 95%', once: true },
            clearProps: 'transform,opacity,filter',
          });
        }
      });
    }, containerRef);
    previousGrid.current = new Map(grid.map(item => [item.id, item]));
    return () => context.revert();
  }, [grid, width, reducedMotion, ease, duration, stagger, animateFrom, blurToFocus, columns]);

  useEffect(() => {
    if (paused) containerRef.current.querySelectorAll('video').forEach(video => video.pause());
  }, [paused]);

  useEffect(() => {
    if (!autoplayVideos) return undefined;
    const videos = Array.from(containerRef.current.querySelectorAll('video'));
    const visible = new Set();
    const sync = () => videos.forEach(video => {
      if (visible.has(video) && !paused && !reducedMotion && !document.hidden) video.play().catch(() => {});
      else video.pause();
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      sync();
    }, { threshold: .25 });
    videos.forEach(video => { observer.observe(video); video.addEventListener('loadeddata', sync); });
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      videos.forEach(video => { video.removeEventListener('loadeddata', sync); video.pause(); });
    };
  }, [autoplayVideos, paused, reducedMotion, grid]);

  const hover = (event, active) => {
    const video = event.currentTarget.querySelector('video');
    if (video && !autoplayVideos) {
      if (active && !paused && !reducedMotion) video.play().catch(() => {});
      else video.pause();
    }
    if (reducedMotion || !scaleOnHover) return;
    gsap.to(event.currentTarget.querySelector('.masonry-visual'), {
      scale: active ? hoverScale : 1, duration: .3, ease: 'power2.out', overwrite: 'auto',
    });
  };

  return <div ref={containerRef} className={`masonry-list${renderDetails ? ' masonry-with-details' : ''}`} style={{ height }} aria-label="Photo and video gallery">
    {grid.map(item => <div className="masonry-item" id={item.anchorId} key={item.id} style={{ left: item.x, top: item.y, width: item.w, height: item.h }}>
      <button type="button" className={`masonry-tile${colorShiftOnHover ? ' masonry-color-shift' : ''}`}
        aria-label={`Open ${item.title}`} onClick={event => onOpen?.(item, event.currentTarget)}
        onPointerEnter={event => hover(event, true)} onPointerLeave={event => hover(event, false)}
        onFocus={event => hover(event, true)} onBlur={event => hover(event, false)}>
        <span className={`masonry-visual${item.type === 'video' ? ' masonry-video' : item.type === 'youtube' ? ' masonry-youtube' : ''}`} style={{ height: item.mediaHeight }}>
          {renderVisual?.(item) || (item.type === 'video'
            ? <video src={item.src} poster={item.poster} muted playsInline loop preload="metadata" onLoadedMetadata={event => measureMedia(item, event.currentTarget)} aria-hidden="true" />
            : <img src={item.src || item.img || item.poster} alt={mediaAlt(item)} loading="lazy" decoding="async" onLoad={event => measureMedia(item, event.currentTarget)} />)}
          <span className="masonry-open" aria-hidden="true">{['video', 'youtube'].includes(item.type) ? 'PLAY FILM ↗' : 'EXPAND ↗'}</span>
        </span>
        {!renderDetails && <span className="masonry-caption"><small>{item.category || (item.type === 'video' ? 'Film' : 'Photo')}</small><strong>{item.title}</strong></span>}
      </button>
      {renderDetails && <div className="masonry-details" data-media-id={item.id}>{renderDetails(item)}</div>}
    </div>)}
  </div>;
}
