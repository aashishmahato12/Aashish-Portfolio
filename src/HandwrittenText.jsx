import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './handwritten-text.css';

gsap.registerPlugin(ScrollTrigger);

// Pen gestures: loops, downstrokes, and separately drawn dots/crossbars.
const strokes = {
  A: ['M .04 1 L .5 .02 L .96 1', 'M .22 .62 L .78 .62'],
  H: ['M .08 .02 L .08 1', 'M .08 .5 L .92 .5', 'M .92 .02 L .92 1'],
  I: ['M .5 .02 L .5 1'],
  M: ['M .06 1 L .06 .02 L .5 .55 L .94 .02 L .94 1'],
  T: ['M .02 .04 L .98 .04', 'M .5 .04 L .5 1'],
  O: ['M .5 .02 C -.13 .02 -.13 1 .5 1 C 1.13 1 1.13 .02 .5 .02'],
  C: ['M .95 .15 C .45 -.15 -.12 .65 .18 .92 C .4 1.16 .78 .68 .98 .55'],
  S: ['M .9 .1 C .6 -.1 .06 .18 .25 .4 C .42 .55 .85 .48 .67 .73 C .49 1.02 .07 1.1 .02 .85'],
  E: ['M .95 .08 C .35 -.1 .2 .4 .65 .43 C .24 .34 -.03 .85 .22 .97 C .48 1.08 .8 .83 .95 .69'],
  F: ['M 1 .05 L .35 .12 M .62 .1 L .15 1', 'M .18 .47 L .8 .4'],
  c: ['M .9 .25 C .65 -.05 .02 .2 .08 .72 C .13 1.1 .65 .9 .98 .65'],
  e: ['M .1 .65 C .55 .6 .95 .05 .55 .15 C .18 .22 -.1 .8 .22 .95 C .5 1.05 .8 .76 1 .57'],
  r: ['M .02 .98 L .4 .12 C .3 .55 .6 .08 .8 .2 L 1 .35'],
  a: ['M .82 .2 C .52 -.1 .05 .4 .05 .8 C .08 1.17 .62 .88 .78 .25 L .58 .88 Q .7 1.06 1 .65'],
  t: ['M .73 .02 L .25 .85 Q .13 1.13 1 .65', 'M .02 .37 L 1 .2'],
  i: ['M .47 .35 L .15 .83 Q .1 1.12 1 .67', 'M .62 .04 L .65 .02'],
  v: ['M .2 .22 C -.05 1.02 .3 1.03 .62 .64 C .78 .42 .9 .14 1 .12'],
  l: ['M .06 .92 C .95 .13 .72 -.26 .45 .2 C .22 .55 -.08 1.15 .5 .92 L 1 .65'],
  d: ['M .65 .49 C .2 .23 -.04 .88 .21 .96 C .55 1.04 .92 .05 .94 .02 L .56 .85 Q .55 1.06 1 .68'],
  o: ['M .65 .2 C .11 -.07 -.13 1.02 .35 .95 C .86 .86 .85 .13 .61 .18 Q .55 .55 1 .46'],
  n: ['M .05 .98 L .38 .2 L .19 .68 C .72 -.15 .93 .18 .66 .78 Q .55 1.08 1 .63'],
  f: ['M .19 1 C .22 .4 .77 -.2 .91 .06 C 1 .29 .49 .55 .09 .49', 'M .12 .55 L 1 .38'],
  b: ['M .08 .96 C .48 .36 .81 -.2 .58 .08 C .25 .39 -.1 1.18 .41 .94 C .95 .69 .97 .2 .6 .37 Q .63 .64 1 .61'],
  k: ['M .05 1 L .78 .02', 'M .94 .3 Q .51 .71 .26 .62 Q .42 1.13 1 .68'],
  x: ['M .11 .22 Q .52 .63 .65 .99', 'M .94 .18 Q .47 .72 .02 .99'],
  p: ['M .45 .16 L .03 1', 'M .35 .5 C .97 -.2 1.13 .41 .54 .65 L 1 .57'],
};

export default function HandwrittenText({ children, className = '', speed = 1.8, delay = .18, play = true, onComplete }) {
  const ref = useRef(null);
  const id = useId().replaceAll(':', '');
  const text = String(children);
  const [drawing, setDrawing] = useState(null);

  useLayoutEffect(() => {
    let disposed = false;
    const ink = ref.current.querySelector('.handwritten-ink');
    const measure = () => {
      if (disposed) return;
      const style = getComputedStyle(ink);
      const size = parseFloat(style.fontSize);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
      const padding = size * .45;
      const letterSpacing = parseFloat(style.letterSpacing) || 0;
      const glyphs = Array.from(text).map((letter, index) => {
        const metric = context.measureText(letter);
        const x = context.measureText(text.slice(0, index)).width + index * letterSpacing;
        return { letter, x: x + padding,
          left: x + padding - metric.actualBoundingBoxLeft,
          top: size + padding - metric.actualBoundingBoxAscent,
          width: Math.max(1, metric.actualBoundingBoxLeft + metric.actualBoundingBoxRight),
          height: Math.max(1, metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent),
        };
      });
      const baseline = ink.offsetTop + ink.querySelector('.handwriting-baseline').offsetTop;
      setDrawing({ glyphs, size, weight: style.fontWeight, padding, baseline, width: context.measureText(text).width + Math.max(0, text.length - 1) * letterSpacing + padding * 2, height: size * 2 });
    };
    document.fonts.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => { disposed = true; window.removeEventListener('resize', measure); };
  }, [text]);

  useLayoutEffect(() => {
    if (!drawing) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const svg = ref.current.querySelector('svg');
        const ink = ref.current.querySelector('.handwritten-ink');
        gsap.set(svg, { opacity: 1 });
        gsap.set(ink, { opacity: 0 });
        gsap.set(svg.querySelectorAll('.handwriting-glyph'), { opacity: 0 });
        const timeline = gsap.timeline({ delay, paused: !play,
          scrollTrigger: play ? { trigger: ref.current, start: 'top 92%', once: true } : undefined,
          onComplete: () => { gsap.set(ink, { opacity: 1 }); gsap.set(svg, { opacity: 0 }); onComplete?.(); },
        });
        timeline.timeScale(speed);
        svg.querySelectorAll('mask').forEach((mask, index) => {
          timeline.set(svg.querySelectorAll('.handwriting-glyph')[index], { opacity: 1 }, '>+.025');
          const paths = mask.querySelectorAll('path');
          paths.forEach((path, stroke) => {
            const length = path.getTotalLength();
            gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
            timeline.to(path, { strokeDashoffset: 0,
              duration: stroke ? .14 : .34 + (index % 3) * .055,
              ease: 'power1.inOut',
            }, '>+.035');
          });
          // Finish tiny brush edges after the pen passes, preserving the exact font.
          timeline.to(mask.querySelector('rect'), { opacity: 1, duration: .09 }, '>-0.025');
        });
      }, ref);
      return () => context.revert();
    });
    return () => media.revert();
  }, [drawing, speed, delay, play, onComplete]);

  return <span className={`${className} handwriting-word`} ref={ref} aria-hidden="true">
    <span className="handwritten-ink">{text}<span className="handwriting-baseline" /></span>
    {drawing && <svg className="handwriting-strokes" viewBox={`0 0 ${drawing.width} ${drawing.height}`} style={{ left: `${-drawing.padding}px`, top: `${drawing.baseline - drawing.size - drawing.padding}px`, width: drawing.width, height: drawing.height }}>
      <defs>{drawing.glyphs.map((glyph, index) => <mask id={`${id}-${index}`} key={index} maskUnits="userSpaceOnUse" x="0" y="0" width={drawing.width} height={drawing.height}>
        {(strokes[glyph.letter] || strokes.e).map((path, stroke) => <path key={stroke} d={path} transform={`translate(${glyph.left} ${glyph.top}) scale(${glyph.width} ${glyph.height})`} fill="none" stroke="white" strokeWidth=".32" strokeLinecap="round" strokeLinejoin="round" />)}
        <rect x="0" y="0" width={drawing.width} height={drawing.height} fill="white" opacity="0" />
      </mask>)}</defs>
      {drawing.glyphs.map((glyph, index) => <text className="handwriting-glyph" key={index} x={glyph.x} y={drawing.size + drawing.padding} mask={`url(#${id}-${index})`} fill="currentColor" style={{ fontFamily: 'inherit', fontSize: drawing.size, fontWeight: drawing.weight, letterSpacing: 0 }}>{glyph.letter}</text>)}
    </svg>}
  </span>;
}
