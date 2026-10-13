import React, { useLayoutEffect, useRef } from 'react';
import { Camera, Film, Clapperboard, Shapes, PenTool, PanelsTopLeft, Code2, House, BriefcaseBusiness, Images, UserRound, Mail } from 'lucide-react';

const skillIcons = { film: Film, photography: Camera, motion: Clapperboard, branding: Shapes, graphic: PenTool, digital: PanelsTopLeft, web: Code2 };
function SocialIcon({ name, size = 18, ...props }) {
  const paths = {
    Instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></>,
    GitHub: <path fill="currentColor" stroke="none" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.82.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.82a9.6 9.6 0 0 1 2.5.34c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />,
    LinkedIn: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" /><path d="M7.5 11v6M11.5 17v-6m0 2a3 3 0 0 1 6 0v4" /></>,
    Facebook: <path d="M14.5 21v-8h3l.5-4h-3.5V7c0-1 .5-1.5 1.5-1.5H18V2h-3c-3 0-5 2-5 5v2H7v4h3v8" />,
    YouTube: <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 6 3-6 3Z" fill="currentColor" stroke="none" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
const pageIcons = { home: House, work: BriefcaseBusiness, gallery: Images, about: UserRound, contact: Mail };

export function PortfolioIcon({ name, kind = 'skill', animated = false, ...props }) {
  const animationRef = useRef(null);
  useLayoutEffect(() => {
    if (!animated) return;
    animationRef.current?.querySelectorAll('path,rect,circle,line,polyline,polygon').forEach(shape => {
      shape.setAttribute('pathLength', '100');
      if (shape.getAttribute('fill') === 'currentColor') shape.classList.add('animated-icon-fill');
    });
  }, [animated, name]);
  const Icon = (kind === 'page' ? pageIcons : skillIcons)[name];
  const graphic = kind === 'social' ? <SocialIcon name={name} {...props} /> : Icon ? <Icon size={18} strokeWidth={1.7} aria-hidden="true" {...props} /> : null;
  if (animated) return <span className="animated-line-icon" ref={animationRef} aria-hidden="true">{graphic}</span>;
  return graphic;
}

