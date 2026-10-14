import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import Root from './Root.jsx';
import { isWebKit } from './browser-performance.js';
import './style.css';
import 'lenis/dist/lenis.css';
import './experience.css';

document.documentElement.classList.toggle('webkit-performance', isWebKit);
const root = document.getElementById('root');
if (root.dataset.ssr === 'home') hydrateRoot(root, <Root />, { onRecoverableError: (error, info) => console.error(error, info.componentStack) });
else createRoot(root).render(<Root />);
