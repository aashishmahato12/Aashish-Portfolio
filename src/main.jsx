import React from 'react';
import { createRoot } from 'react-dom/client';
import Experience from './Experience.jsx';
import './style.css';
import 'lenis/dist/lenis.css';
import './experience.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Experience />
  </React.StrictMode>
);
