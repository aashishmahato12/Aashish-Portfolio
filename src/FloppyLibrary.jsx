import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronDown } from 'lucide-react';
import './floppy-library.css';
import { playSound } from './creative-sfx';

const colors = ['#5b8176', '#c19a5b', '#b77760', '#719397', '#8a8099', '#84936c', '#73849b'];

export default function FloppyLibrary({ items, active, onSelect }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeMotion = useRef(null);
  const grid = useRef(null);
  const library = useRef(null);
  const flight = useRef(null);
  const [loading, setLoading] = useState(null);
  useEffect(() => () => {
    closeMotion.current?.kill();
    flight.current?.timeline.kill();
    flight.current?.ghost.remove();
    flight.current?.target.classList.remove('is-loading-disk');
  }, []);

  function toggleBox() {
    playSound(open ? 'close' : 'open');
    if (!open) { setOpen(true); return; }
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
      gsap.utils.toArray('.floppy-choice', grid.current).forEach((disk, index) => {
        const from = origins[index].getBoundingClientRect();
        const to = disk.getBoundingClientRect();
        gsap.fromTo(disk, { x: from.left - to.left, y: from.top - to.top, scale: .5, rotation: (index - 3) * 4, opacity: 1 }, { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, duration: .5, delay: .06 + index * .035, ease: 'power3.inOut', clearProps: 'transform,opacity' });
      });
    }, grid);
    return () => context.revert();
  }, [open]);
  return <div className={`floppy-library ${open ? 'is-open' : ''} ${closing ? 'is-closing' : ''}`} ref={library} aria-busy={loading !== null}>
    <button className="floppy-box-toggle" type="button" disabled={loading !== null || closing} aria-expanded={open} aria-controls="discipline-disks" onClick={toggleBox}>
      <span className="floppy-box-scene" aria-hidden="true">
        <span className="floppy-box-lid" />
        <span className="floppy-box-back" />
        <span className="floppy-box-stack">{items.map((item, index) => <span className="floppy-mini" key={item.name} style={{ '--disk-color': colors[index], '--disk-index': index }}><span className="floppy-shutter" /><span className="floppy-mini-label">{item.name}</span></span>)}</span>
        <span className="floppy-box-front"><span>A / M · 07 DISKS</span></span>
      </span>
      <span className="floppy-box-title"><strong>My creative toolkit.</strong><ChevronDown size={18} aria-hidden="true" /></span>
      <span className="floppy-box-instruction">{open ? 'Close the box ↑' : 'Open the box. Pick a discipline. ↓'}</span>
    </button>
    <div id="discipline-disks" hidden={!open} ref={grid}>
      <div className="floppy-disk-grid" role="group" aria-label="Choose a floppy disk to load into the TV">
        {items.map((item, index) => <button className="floppy-choice" type="button" key={item.name} style={{ '--disk-color': colors[index] }} aria-pressed={active === index} aria-label={`Load ${item.name} disk`} disabled={loading !== null || closing} onPointerEnter={event => { if (event.pointerType !== 'touch' && loading === null && !closing) playSound('hover'); }} onFocus={() => { if (loading === null && !closing) playSound('hover'); }} onClick={event => loadDisk(index, event.currentTarget)}>
          <span className="floppy-disk" aria-hidden="true"><span className="floppy-shutter"><i /></span><span className="floppy-label"><span>AASHISH MAHATO / {String(index + 1).padStart(2, '0')}</span><strong>{item.name}</strong><span className="floppy-label-lines" /><small>{active === index ? '● NOW PLAYING' : 'LOAD DISCIPLINE ↗'}</small></span><span className="floppy-notch" /></span>
          <span className="floppy-disk-caption">{String(index + 1).padStart(2, '0')} / {item.name}</span>
        </button>)}
      </div>
      <p className="floppy-library-note" role="status">{loading ? `Loading ${loading} into the TV…` : 'Seven ways to make an idea real. Select a disk to preview the work.'}</p>
    </div>
  </div>;
}
