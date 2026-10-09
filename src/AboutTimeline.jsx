import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import './about-timeline.css';
import { Monitor, Clapperboard, Palette, Camera, GraduationCap, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);
const milestones = [
  { year: '2020', title: 'MY FIRST COMPUTER', detail: 'I started using a computer in 2020 and learning about IT, graphic design, and video editing.' },
  { year: '2023', title: 'MY FIRST COMPLETE VIDEO', detail: 'I completed my first video in 2023 while learning filming and editing.', href: 'https://www.youtube.com/watch?v=Bd_L1rkCnG4', link: 'Watch my first video' },
  { year: '2023 ONWARD', title: 'STARTING GRAPHIC DESIGN', detail: 'I started designing LinkedIn banners and social media posters. I later worked with Cosmic Electrical on graphic design projects.', href: '/work/graphic/', link: 'Explore my graphic design' },
  { year: '24 OCT 2024', title: 'FILMMAKING AND PHOTOGRAPHY', detail: 'I made my Mustang travel film in October 2024. Around the same time, I started taking portraits, landscape, and travel photographs.', href: 'https://www.instagram.com/reel/DBfY2XxoWRX/', link: 'Watch the Mustang reel' },
  { year: '17 JUN 2026', title: 'HERALD COLLEGE KATHMANDU', detail: 'I joined Herald College Kathmandu on 17 June 2026 and started building web applications. I also began creating motion graphics for college projects.', href: '/work/', link: 'View my work' },
];
const milestoneIcons = [Monitor, Clapperboard, Palette, Camera, GraduationCap];
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
    <div className="experience-section-top"><span>02 / MY JOURNEY</span><span>2020 / STILL EXPLORING</span></div>
    <div className="about-timeline-heading"><span>MY EXPERIENCE</span><h2 id="about-timeline-title">ALWAYS<br /><em>IN MOTION.</em></h2><p>My experience in design, video, photography, and web development.</p></div>
    <div className="about-timeline-stage"><svg className="about-journey-path" viewBox="0 0 600 1200" aria-hidden="true" preserveAspectRatio="none"><path className="about-timeline-guide" d={path} /><path className="about-timeline-path" d={path} /><circle className="about-timeline-ball" r="15" cx="0" cy="0" />{milestones.map((item, index) => <circle className="about-timeline-marker" key={item.year} cx={[280,315,295,310,310][index]} cy={155 + index * 220} r="11" />)}</svg>
      <div className="about-timeline-list">{milestones.map((item, index) => <article className="about-timeline-entry" key={`${item.year}-${index}`}><div className="about-milestone-top"><div className="about-milestone-icon">{React.createElement(milestoneIcons[index], { size: 23, 'aria-hidden': true })}</div><span>{item.year}</span></div><h3>{item.title}</h3><p>{item.detail}</p>{item.href && <a className="about-timeline-link" href={item.href} {...(item.href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{item.link}<ArrowUpRight size={15} aria-hidden="true" /></a>}</article>)}</div>
    </div>
  </section>;
}
