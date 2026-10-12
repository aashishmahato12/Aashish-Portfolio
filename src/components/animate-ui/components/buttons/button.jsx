import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './button.css';

// Animate UI's hover/tap API, with native links for navigation.
export function Button({ variant = 'default', size = 'default', hoverScale = 1.05, tapScale = .95, className = '', href, children, ...props }) {
  const reducedMotion = useReducedMotion();
  const Component = href ? motion.a : motion.button;
  return <Component
    {...props}
    {...(href ? { href } : { type: props.type || 'button' })}
    className={`animated-button animated-button--${variant} animated-button--${size} ${className}`}
    whileHover={reducedMotion ? undefined : { scale: hoverScale }}
    whileTap={reducedMotion ? undefined : { scale: tapScale }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  >{children}</Component>;
}
