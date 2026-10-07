import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import './about-timeline.css';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);
const milestones = [
  { year: '01', title: 'PLACES IN MOTION', detail: 'Mustang and Manang: travel films exploring landscapes in Nepal.' },
  { year: '02', title: 'PEOPLE AND PLACES', detail: 'Street portraits, Boudhanath, prayer flags, and nature photography.' },
  { year: '03', title: 'IDENTITY AND DESIGN', detail: 'CIC Nepal booklet presentations, Decora identity cards, and Cosmic Group campaign graphics.' },
  { year: '04', title: 'IDEAS IN MOVEMENT', detail: 'Product Motion: an animated presentation of a digital driving licence experience.' },
  { year: '05', title: 'DESIGN INTO CODE', detail: 'Cosmic Electrical, UniSync, and this portfolio: websites and React interfaces with public project links.' },
];
const path = 'M 72 0 C 540 125 55 210 328 320 S 550 470 294 600 S 52 750 322 850 S 535 1000 300 1120';

export default function AboutTimeline() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const root = ref.current;
    const line = root.querySelector('.about-timeline-path');
    const ball = root.querySelector('.about-timeline-ball');
    const markers = gsap.utils.toArray('.about-timeline-marker', root);
    const length = line.getTotalLength();
    markers.forEach((marker, index) => {
      const point = line.getPointAtLength(length * (index + 1) / (markers.length + 1));
      marker.setAttribute('cx', point.x);
      marker.setAttribute('cy', point.y);
    });
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const timeline = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 65%', end: 'bottom 70%', scrub: .7 } })
          .set(markers, { autoAlpha: 0, scale: .4, transformOrigin: 'center center' }, 0)
          .fromTo(line, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', duration: 1 }, 0)
          .fromTo(ball, { autoAlpha: 0, scale: .5 }, { autoAlpha: 1, scale: 1, duration: .04 }, 0)
          .to(ball, { motionPath: { path: line, align: line, alignOrigin: [.5, .5] }, ease: 'none', duration: 1 }, 0);
        markers.forEach((marker, index) => {
          const position = (index + 1) / (markers.length + 1);
          timeline.to(marker, { autoAlpha: 1, scale: 1.6, duration: .035, ease: 'back.out(2)' }, position)
            .to(marker, { scale: 1, duration: .045, ease: 'power2.out' }, position + .035);
        });
        gsap.utils.toArray('.about-timeline-entry', root).forEach((entry) => gsap.from(entry, { autoAlpha: 0, y: 32, duration: .75, ease: 'power3.out', scrollTrigger: { trigger: entry, start: 'top 84%', once: true } }));
      }, ref);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  return <section className="about-timeline experience-shell" ref={ref} aria-labelledby="about-timeline-title">
    <div className="experience-section-top"><span>02 / SELECTED WORK</span><span>FILM / IMAGE / DESIGN / CODE</span></div>
    <div className="about-timeline-heading"><span>WAYS I MAKE</span><h2 id="about-timeline-title">ALWAYS<br /><em>IN MOTION.</em></h2><p>A selection of the films, photographs, designs, and websites in my portfolio.</p></div>
    <div className="about-timeline-stage"><svg viewBox="0 0 600 1200" aria-hidden="true" preserveAspectRatio="none"><path className="about-timeline-guide" d={path} /><path className="about-timeline-path" d={path} /><circle className="about-timeline-ball" r="15" cx="0" cy="0" />{milestones.map((item, index) => <circle className="about-timeline-marker" key={item.year} cx={[280,315,295,310,310][index]} cy={155 + index * 220} r="11" />)}</svg>
      <div className="about-timeline-list">{milestones.map((item) => <article className="about-timeline-entry" key={item.year}><span>{item.year} / PORTFOLIO</span><h3>{item.title}</h3><p>{item.detail}</p></article>)}</div>
    </div>
  </section>;
}
