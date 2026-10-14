import React from 'react';
import { SiteHeader, SiteFooter } from './SiteChrome.jsx';
import { videoPages } from './video-pages.js';
import './video-watch.css';

export default function VideoWatchPage({ videoId }) {
  const page = videoPages.find(item => item.id === videoId);
  return <div className="inner-page video-watch-page"><SiteHeader current="work" /><main className="experience-shell video-watch-content">
    <a className="experience-text-link" href={page.collection}>← {page.category === 'Motion Graphics' ? 'MOTION GRAPHICS' : 'ALL FILMS'}</a>
    <h1>{page.title}<span>.</span></h1>
    <div className="video-watch-player">{page.playerUrl
      ? <iframe src={`${page.playerUrl}?playsinline=1&rel=0`} title={page.title} allow="autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
      : <video src={page.media.src} poster={page.thumbnail} controls playsInline preload="metadata" aria-label={page.title} />}</div>
    <p>{page.description}</p><p className="video-watch-credit">Film and moving-image work by Aashish Mahato, Kathmandu, Nepal.</p>
    <nav className="video-watch-related" aria-label="More videos"><h2>More to watch</h2>{videoPages.filter(item => item.id !== page.id).map(item => <a href={item.path} key={item.id}>{item.title} ↗</a>)}</nav>
  </main><SiteFooter /></div>;
}
