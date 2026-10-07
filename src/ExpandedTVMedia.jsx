import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);
export default function ExpandedTVMedia({ item, slide, origin, startTime, muted, playing, onVideoEnd, onClose }) {
  const dialog = useRef(null);
  const frame = useRef(null);
  const video = useRef(null);
  const rail = useRef(null);
  const carousel = useRef(null);
  const motionRef = useRef(null);
  const scaleTween = useRef(null);
  const closing = useRef(false);
  const slides = useRef(item.slides ? [...item.slides.slice(slide), ...item.slides.slice(0, slide)] : []);
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onClose(video.current?.currentTime); return; }
    // Freeze the scroll-driven scale before returning to the physical screen.
    scaleTween.current?.scrollTrigger?.kill(false);
    scaleTween.current?.kill();
    gsap.killTweensOf(frame.current);
    motionRef.current.add(() => {
      gsap.timeline({ onComplete: () => onClose(video.current?.currentTime) })
        .to(dialog.current.querySelectorAll('.tv-expanded-close, .tv-expanded-instruction'), { opacity: 0, duration: .15 }, 0)
        .to(dialog.current, { '--preview-shade': 0, duration: .55, ease: 'power2.inOut' }, 0)
        .to(frame.current, { scaleX: origin.width / innerWidth, scaleY: origin.height / innerHeight, x: origin.left + origin.width / 2 - innerWidth / 2, y: origin.top + origin.height / 2 - innerHeight / 2, borderRadius: 6, duration: .65, ease: 'power3.inOut' }, 0);
    });
  };
  useLayoutEffect(() => {
    const element = dialog.current;
    element.showModal();
    if (video.current) video.current.currentTime = startTime;
    const motion = gsap.context(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.fromTo(frame.current, { scaleX: origin.width / innerWidth, scaleY: origin.height / innerHeight, x: origin.left + origin.width / 2 - innerWidth / 2, y: origin.top + origin.height / 2 - innerHeight / 2, borderRadius: 6 }, { scaleX: .78, scaleY: .78, x: 0, y: 0, duration: .65, ease: 'power3.inOut', onComplete: () => {
        if (!closing.current) motion.add(() => { scaleTween.current = gsap.fromTo(frame.current, { scaleX: .78, scaleY: .78 }, { scaleX: 1, scaleY: 1, borderRadius: 0, ease: 'none', scrollTrigger: { trigger: element.querySelector('.tv-expanded-scroll'), scroller: element, start: 'top top', end: 'bottom bottom', scrub: .35 } }); });
      } });
      if (rail.current) carousel.current = gsap.to(rail.current, { xPercent: -100 * slides.current.length, duration: slides.current.length * 4.5, ease: 'none', repeat: -1, paused: !playing });
    }, element);
    motionRef.current = motion;
    return () => { motion.revert(); element.close(); };
  }, []);
  return <dialog className="tv-expanded" ref={dialog} aria-label={`${item.name} expanded preview`} onCancel={event => { event.preventDefault(); close(); }} data-lenis-prevent>
    <button className="tv-expanded-close" type="button" onClick={close} aria-label="Close expanded preview"><X size={20} /> Close</button>
    <div className="tv-expanded-scroll"><div className="tv-expanded-sticky">
      <div className="tv-expanded-frame" ref={frame}>
        {item.video ? <video ref={video} src={item.video} poster={item.image} autoPlay loop={!item.rotateFilms} onEnded={onVideoEnd} muted={muted} playsInline controls /> : slides.current.length > 1 ? <div className="tv-expanded-rail" ref={rail}>{[...slides.current, slides.current[0]].map((image, index) => <img key={`${image.src}-${index}`} src={image.src} alt={index === slides.current.length ? '' : image.title} aria-hidden={index === slides.current.length || undefined} />)}</div> : <img src={item.image} alt={item.caption} />}
      </div>
      <p className="tv-expanded-instruction">Scroll to fill the screen ↓</p>
    </div></div>
  </dialog>;
}
