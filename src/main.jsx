import React from 'react';
import { createRoot } from 'react-dom/client';
import Experience from './Experience.jsx';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './style.css';
import 'lenis/dist/lenis.css';
import './experience.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Experience />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>
);
