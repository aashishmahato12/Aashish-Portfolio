import React from 'react';
import Experience from './Experience.jsx';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function Root() {
  return <React.StrictMode><Experience /><Analytics /><SpeedInsights /></React.StrictMode>;
}
