import { videoPages } from '../src/video-pages.js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { featuredProjects, galleryMedia, heroReel, webProjects } from '../src/portfolio-data.js';

const base = 'https://aashish-mahato.com.np';
const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), '../public');
const image = (src) => new URL(src, base).href;
const mediaImage = (item) => item.type === 'video' ? item.poster : item.src;
const photos = galleryMedia.filter((item) => item.category === 'Photography');
const projectMedia = featuredProjects.flatMap((project) => project.media);
const brandProjects = featuredProjects.filter((project) => project.category === 'Brand & Digital');
const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const pages = [
  ['/', ['/media/photos/about-backlight-white.webp', heroReel.poster, ...featuredProjects.map((project) => project.cover)]],
  ['/work/', featuredProjects.map(project => project.cover)],
  ['/contact/', []],
  ['/privacy/', []],
  ['/about/', ['/media/photos/about-backlight-white.webp']],
  ['/gallery/', [...galleryMedia, ...projectMedia].map(mediaImage)],
  ['/work/film/', [heroReel.poster, ...featuredProjects.filter((project) => project.category === 'Travel Film').map((project) => project.cover)]],
  ['/work/photography/', photos.map((item) => item.src)],
  ['/work/motion/', [featuredProjects[2].cover]],
  ['/work/branding/', brandProjects.flatMap((project) => project.media.filter((item) => item.category === 'Branding').map((item) => item.src))],
  ['/work/graphic/', featuredProjects.filter((project) => project.category === 'Graphic Design').flatMap((project) => project.media.map((item) => item.src))],
  ['/work/ui-ux/', brandProjects.flatMap((project) => project.media.filter((item) => item.category === 'Digital').map((item) => item.src))],
  ['/work/web/', webProjects.map(project => project.cover)],
];

pages.push(...videoPages.map(video => [video.path, [video.thumbnail]]));

const entries = pages.map(([path, sources]) => {
  const imageEntries = [...new Set(sources.filter(Boolean))]
    .map((src) => `    <image:image><image:loc>${escapeXml(image(src))}</image:loc></image:image>`)
    .join('\n');
  const video = videoPages.find(item => item.path === path);
  const videoEntry = video ? `\n    <video:video><video:thumbnail_loc>${escapeXml(image(video.thumbnail))}</video:thumbnail_loc><video:title>${escapeXml(video.title)}</video:title><video:description>${escapeXml(video.description)}</video:description>${video.playerUrl ? `<video:player_loc>${escapeXml(video.playerUrl)}</video:player_loc>` : `<video:content_loc>${escapeXml(video.media.src)}</video:content_loc>`}</video:video>` : '';
  return `  <url>\n    <loc>${base}${path}</loc>${videoEntry}${imageEntries ? `\n${imageEntries}` : ''}\n  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${entries.join('\n')}\n</urlset>\n`;
writeFileSync(resolve(publicDir, 'sitemap.xml'), xml);
