import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ProjectsPage from './ProjectsPage.jsx';
import SiteRouter from './SiteRouter.jsx';
import './shadcn.css';
import './style.css';
import 'lenis/dist/lenis.css';
import './redesign.css';
import './projects.css';
import './projects-theme.css';
import './site-router.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SiteRouter home={<App />} projects={<ProjectsPage />} />
  </React.StrictMode>
);
