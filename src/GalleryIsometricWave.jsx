import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './gallery-isometric-wave.css';

gsap.registerPlugin(ScrollTrigger);

export default function GalleryIsometricWave({ items }) {
  const rootRef = useRef(null);
  const stateRef = useRef({ scroll: 0, drag: 0, wave: 0, spread: 0, active: -1, velocity: 0, render: null });
  const draggedRef = useRef(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const media = gsap.matchMedia();
    media.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const windowEl = root.querySelector('.gallery-iso-window');
        const tiles = gsap.utils.toArray('.gallery-iso-tile', root);
        const state = stateRef.current;
        const columns = Math.ceil(tiles.length / 3);
        let pointer = null;
        let cardWidth = 0;
        let cardHeight = 0;
        let step = 0;
        let totalWidth = 0;
        let waveTween = null;
        let dragTween = null;

        const measure = () => {
          cardWidth = tiles[0].offsetWidth;
          cardHeight = tiles[0].offsetHeight;
          step = cardWidth + Math.max(25, cardWidth * .13);
          totalWidth = columns * step;
          render();
        };

        const tileX = (index) => gsap.utils.wrap(-totalWidth / 2, totalWidth / 2, Math.floor(index / 3) * step - totalWidth / 2 - state.scroll - state.drag);

        const render = () => {
          if (!totalWidth) return;
          const activeX = state.active >= 0 ? tileX(state.active) : 0;
          tiles.forEach((tile, index) => {
            const row = index % 3;
            const x = tileX(index);
            const distance = x - activeX;
            const neighbour = state.active >= 0 && index !== state.active && row === state.active % 3 && Math.abs(distance) < step * 1.6;
            const push = neighbour ? Math.sign(distance || 1) * 50 * state.spread : 0;
            const wave = Math.sin(x / step * 1.25 - row * .8) * state.wave;
            const selected = index === state.active ? state.spread : 0;
            gsap.set(tile, { x: x + push, y: (row - 1) * (cardHeight + 30) + wave, z: Math.cos(x / step - row) * state.wave * .9 + selected * 125, scale: 1 + selected * .08, zIndex: selected ? 8 : 1 });
          });
        };

        state.render = render;
        measure();
        const resize = () => measure();
        window.addEventListener('resize', resize);
        ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onUpdate: (trigger) => {
          state.scroll = trigger.progress * totalWidth * .65;
          state.wave = Math.min(65, Math.abs(trigger.getVelocity()) * .007);
          render();
          gsap.to(state, { wave: 0, duration: .7, ease: 'power2.out', overwrite: 'auto', onUpdate: render });
        } });

        const down = (event) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          dragTween?.kill();
          waveTween?.kill();
          pointer = { id: event.pointerId, x: event.clientX, lastX: event.clientX, lastTime: performance.now(), drag: state.drag };
          draggedRef.current = false;
          windowEl.classList.add('is-dragging');
        };
        const move = (event) => {
          if (!pointer || event.pointerId !== pointer.id) return;
          const delta = pointer.x - event.clientX;
          if (Math.abs(delta) > 6) {
            draggedRef.current = true;
            if (!windowEl.hasPointerCapture(event.pointerId)) windowEl.setPointerCapture(event.pointerId);
          }
          state.drag = pointer.drag + delta * 1.2;
          const now = performance.now();
          const elapsed = Math.max(16, now - pointer.lastTime);
          state.velocity = (pointer.lastX - event.clientX) / elapsed;
          state.wave = Math.min(75, Math.abs(state.velocity) * 42);
          pointer.lastX = event.clientX;
          pointer.lastTime = now;
          render();
        };
        const up = (event) => {
          if (!pointer || event.pointerId !== pointer.id) return;
          pointer = null;
          windowEl.classList.remove('is-dragging');
          if (windowEl.hasPointerCapture(event.pointerId)) windowEl.releasePointerCapture(event.pointerId);
          state.active = -1;
          gsap.to(state, { spread: 0, duration: .4, onUpdate: render, overwrite: 'auto' });
          dragTween = gsap.to(state, { drag: state.drag + state.velocity * 160, duration: 1.15, ease: 'power3.out', onUpdate: render });
          waveTween = gsap.to(state, { wave: 0, duration: 1.2, ease: 'power2.out', onUpdate: render });
        };
        windowEl.addEventListener('pointerdown', down);
        windowEl.addEventListener('pointermove', move);
        windowEl.addEventListener('pointerup', up);
        windowEl.addEventListener('pointercancel', up);

        return () => {
          window.removeEventListener('resize', resize);
          windowEl.removeEventListener('pointerdown', down);
          windowEl.removeEventListener('pointermove', move);
          windowEl.removeEventListener('pointerup', up);
          windowEl.removeEventListener('pointercancel', up);
          dragTween?.kill();
          waveTween?.kill();
          state.render = null;
        };
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, [items.length]);

  const hover = (index, entering) => {
    const state = stateRef.current;
    if (!state.render || draggedRef.current) return;
    state.active = entering ? index : -1;
    gsap.to(state, { spread: entering ? 1 : 0, duration: entering ? .4 : .65, ease: entering ? 'power3.out' : 'elastic.out(1,.65)', onUpdate: state.render, overwrite: 'auto' });
  };

  return <section className="gallery-iso" ref={rootRef} aria-labelledby="gallery-iso-title">
    <div className="gallery-iso-heading experience-shell"><span>THE ARCHIVE / ANOTHER ANGLE</span><h2 id="gallery-iso-title">TAKE IT<br /><em>FOR A SPIN.</em></h2><p>Drag across the frames. Scroll to watch them move.</p></div>
    <div className="gallery-iso-window" aria-label="Isometric gallery of photos and video previews">
      <div className="gallery-iso-scene">{items.map((item, index) => <a className="gallery-iso-tile" href={`#gallery-item-${item.id}`} key={item.id} onPointerEnter={() => hover(index, true)} onPointerLeave={() => hover(index, false)} onClick={(event) => { if (draggedRef.current) { event.preventDefault(); draggedRef.current = false; } }} aria-label={`View ${item.title} in the archive`}><img src={item.type === 'video' ? item.poster : item.src} alt="" loading="lazy" draggable="false" /><span>{item.type === 'video' ? 'PLAY FILM ↗' : `${String(index + 1).padStart(2, '0')} / VIEW ↗`}</span></a>)}</div>
    </div>
    <div className="gallery-iso-foot experience-shell"><span>DRAG TO EXPLORE ↔</span><span>PHOTOS / FILMS / IDEAS</span></div>
  </section>;
}
