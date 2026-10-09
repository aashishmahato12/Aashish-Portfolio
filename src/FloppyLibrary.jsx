import React, { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronDown } from 'lucide-react';
import './floppy-library.css';
import { playSound } from './creative-sfx';

const colors = ['#e34530', '#292929', '#c63826', '#444444', '#a92c1d', '#666666', '#111111'];

export default function FloppyLibrary({ items, active, onSelect, controlRef }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [opening, setOpening] = useState(false);
  const closeMotion = useRef(null);
  const grid = useRef(null);
  const library = useRef(null);
  const flight = useRef(null);
  const autoOpened = useRef(false);
  const [loading, setLoading] = useState(null);
  useEffect(() => {
    let frame;
    const checkPosition = () => {
      frame = null;
      if (closing || opening || loading || flight.current) return;
      const bounds = library.current.querySelector('.floppy-box-toggle').getBoundingClientRect();
      // Separate entry and exit points keep the lid steady near the viewport edge.
      if (bounds.top > innerHeight * .82 && autoOpened.current) {
        autoOpened.current = false;
        if (open) animateBox(false);
      } else if (bounds.top < innerHeight * .65 && bounds.bottom > 0 && !autoOpened.current) {
        autoOpened.current = true;
        if (!open) animateBox(true);
      }
    };
    const scheduleCheck = () => {
      if (!frame) frame = requestAnimationFrame(checkPosition);
    };
    window.addEventListener('scroll', scheduleCheck, { passive: true });
    window.addEventListener('resize', scheduleCheck);
    scheduleCheck();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleCheck);
      window.removeEventListener('resize', scheduleCheck);
    };
  }, [open, closing, opening, loading]);
  useEffect(() => () => {
    closeMotion.current?.kill();
    flight.current?.timeline.kill();
    flight.current?.ghost.remove();
    flight.current?.target.classList.remove('is-loading-disk');
  }, []);

  function toggleBox() {
    autoOpened.current = true;
    animateBox(!open);
  }

  function animateBox(nextOpen) {
    playSound(nextOpen ? 'open' : 'close');
    if (nextOpen) { setOpening(!matchMedia('(prefers-reduced-motion: reduce)').matches); setOpen(true); return; }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setOpen(false); return; }
    setClosing(true);
    const origins = library.current.querySelectorAll('.floppy-mini');
    const disks = Array.from(grid.current.querySelectorAll('.floppy-choice'));
    const timeline = gsap.timeline({ onComplete: () => { setOpen(false); setClosing(false); closeMotion.current = null; } });
    closeMotion.current = timeline;
    disks.forEach((disk, index) => {
      const from = disk.getBoundingClientRect(), to = origins[index].getBoundingClientRect();
      timeline.to(disk, { x: to.left - from.left, y: to.top - from.top, scale: .5, rotation: (index - 3) * 4, opacity: 0, duration: .65, ease: 'power3.inOut' }, (disks.length - index - 1) * .045);
    });
    timeline.to(grid.current, { height: 0, duration: .45, ease: 'power3.inOut' }, .62);
  }

  useImperativeHandle(controlRef, () => ({ eject }), [active, open, closing, opening, loading]);

  function eject(drivePoint) {
    if (active === null || flight.current || closing || opening) return;
    const index = active;
    playSound('lift');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onSelect(null); return; }
    const button = grid.current.querySelectorAll('.floppy-choice')[index];
    const disk = button.querySelector('.floppy-disk');
    const destination = open ? disk.getBoundingClientRect() : library.current.querySelectorAll('.floppy-mini')[index].getBoundingClientRect();
    const width = open ? destination.width : 140;
    const target = library.current.closest('.kinetic-playground').querySelector('.creative-tv-drive');
    const drive = drivePoint || target.getBoundingClientRect();
    const ghost = disk.cloneNode(true);
    ghost.classList.add('floppy-flying-disk');
    ghost.style.setProperty('--disk-color', colors[index]);
    const left = drive.left - width / 2, top = drive.top - width / 2;
    Object.assign(ghost.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${width}px` });
    document.body.appendChild(ghost);
    gsap.set(ghost, { scale: .65, rotationX: 76 });
    if (open) gsap.set(disk, { opacity: 0 });
    setLoading('Ejecting ' + items[index].name);
    onSelect(null);
    const timeline = gsap.timeline({ onComplete: () => {
      ghost.remove(); flight.current = null; setLoading(null); playSound('insert');
      if (open) { gsap.set(disk, { clearProps: 'opacity' }); gsap.fromTo(disk, { y: -7 }, { y: 0, duration: .22, ease: 'power2.out', clearProps: 'transform' }); }
    } });
    flight.current = { timeline, ghost, target };
    timeline.to(ghost, { y: -65, rotationX: 0, rotation: 10, scale: .9, duration: .2, ease: 'power2.out' })
      .to(ghost, { x: destination.left + destination.width / 2 - drive.left, y: destination.top + destination.height / 2 - drive.top, rotation: open ? 0 : (index - 3) * 2, scale: open ? 1 : destination.width / width, duration: .48, ease: 'power3.inOut' });
  }

  function loadDisk(index, button) {
    if (flight.current) return;
    playSound('lift');
    const target = library.current.closest('.kinetic-playground').querySelector('.creative-tv-drive');
    if (!target || matchMedia('(prefers-reduced-motion: reduce)').matches) { playSound('insert'); onSelect(index); return; }
    const disk = button.querySelector('.floppy-disk');
    const origin = disk.getBoundingClientRect();
    const ghost = disk.cloneNode(true);
    ghost.classList.add('floppy-flying-disk');
    ghost.style.setProperty('--disk-color', colors[index]);
    Object.assign(ghost.style, { left: `${origin.left}px`, top: `${origin.top}px`, width: `${origin.width}px`, height: `${origin.height}px` });
    document.body.appendChild(ghost);
    setLoading(items[index].name);
    target.classList.add('is-loading-disk');
    const destination = target.getBoundingClientRect();
    const offscreen = destination.top < 60 || destination.bottom > innerHeight - 40;
    if (offscreen) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timeline = gsap.timeline({ onComplete: () => {
      ghost.remove(); target.classList.remove('is-loading-disk');
      playSound('insert');
      flight.current = null; setLoading(null); onSelect(index);
      gsap.fromTo(target, { opacity: .3 }, { opacity: 1, duration: .2, repeat: 3, yoyo: true, clearProps: 'opacity' });
    } });
    flight.current = { timeline, ghost, target };
    timeline.to(ghost, { y: (offscreen ? innerHeight * .3 : Math.max(70, Math.min(origin.top, destination.top) - 70)) - origin.top, rotation: -12, scale: 1.08, duration: offscreen ? .3 : .14, ease: 'power2.out' })
      .to(ghost, { x: () => { const rect = target.getBoundingClientRect(); return rect.left + rect.width / 2 - origin.left - origin.width / 2; }, y: () => { const rect = target.getBoundingClientRect(); return rect.top + rect.height / 2 - origin.top - origin.height / 2 - 30; }, scale: .55, rotation: 0, rotationX: 76, duration: .34, ease: 'power2.inOut' })
      .to(ghost, { y: '+=30', scaleY: .08, scaleX: .38, opacity: 0, duration: .1, ease: 'power2.in' });
  }
  useLayoutEffect(() => {
    if (!open || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      const origins = library.current.querySelectorAll('.floppy-mini');
      const expandedHeight = grid.current.scrollHeight;
      gsap.fromTo(grid.current, { height: 0 }, { height: expandedHeight, duration: .7, ease: 'power3.inOut', clearProps: 'height', onComplete: () => setOpening(false) });
      gsap.utils.toArray('.floppy-choice', grid.current).forEach((disk, index) => {
        const from = origins[index].getBoundingClientRect();
        const to = disk.getBoundingClientRect();
        gsap.fromTo(disk, { x: from.left - to.left, y: from.top - to.top, scale: .5, rotation: (index - 3) * 4, opacity: 1 }, { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, duration: .5, delay: .18 + index * .035, ease: 'power3.inOut', clearProps: 'transform,opacity' });
      });
    }, grid);
    return () => context.revert();
  }, [open]);
  return <div className={`floppy-library ${open ? 'is-open' : ''} ${closing ? 'is-closing' : ''}`} ref={library} aria-busy={loading !== null}>
      <button className="floppy-box-toggle" type="button" disabled={loading !== null || closing || opening} aria-expanded={open} aria-controls="discipline-disks" onClick={toggleBox}>
      <span className="floppy-box-scene" aria-hidden="true">
        <span className="floppy-box-lid" />
        <span className="floppy-box-back" />
        <span className="floppy-box-stack">{items.map((item, index) => <span className="floppy-mini" key={item.name} style={{ '--disk-color': colors[index], '--disk-index': index }}><span className="floppy-shutter" /><span className="floppy-mini-label">{item.name}</span></span>)}</span>
        <span className="floppy-box-front"><span>A / M · 07 DISKS</span></span>
      </span>
      <span className="floppy-box-title"><strong>Choose a skill.</strong><ChevronDown size={18} aria-hidden="true" /></span>
      <span className="floppy-box-instruction">{open ? 'Close the box ↑' : 'Open the box. Pick a discipline. ↓'}</span>
    </button>
    <div id="discipline-disks" hidden={!open} ref={grid}>
      <div className="floppy-disk-grid" role="group" aria-label="Choose a floppy disk to load into the TV">
        {items.map((item, index) => <button className="floppy-choice" type="button" key={item.name} style={{ '--disk-color': colors[index] }} aria-pressed={active === index} aria-label={`Load ${item.name} disk`} disabled={loading !== null || closing} onPointerEnter={event => { if (event.pointerType !== 'touch' && loading === null && !closing) playSound('hover'); }} onFocus={() => { if (loading === null && !closing) playSound('hover'); }} onClick={event => loadDisk(index, event.currentTarget)}>
          <span className="floppy-disk" aria-hidden="true"><span className="floppy-shutter"><i /></span><span className="floppy-label"><span>AASHISH MAHATO / {String(index + 1).padStart(2, '0')}</span><strong>{item.name}</strong><span className="floppy-label-lines" /><small>{active === index ? '● NOW PLAYING' : 'LOAD DISCIPLINE ↗'}</small></span><span className="floppy-notch" /></span>
          <span className="floppy-disk-caption">{String(index + 1).padStart(2, '0')} / {item.name}</span>
        </button>)}
      </div>
      <p className="floppy-library-note" role="status">{loading ? (loading.startsWith('Ejecting ') ? `${loading} back to the box…` : `Loading ${loading} into the TV…`) : 'Select a disk to view projects for that skill.'}</p>
    </div>
  </div>;
}
