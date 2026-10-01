import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { featuredProjects, galleryMedia, heroReel, webProjects } from '../src/portfolio-data.js';

const base = 'https://aashish-mahato.com.np';
const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), '../public');
const image = (src) => `${base}${src}`;
const mediaImage = (item) => item.type === 'video' ? item.poster : item.src;
const photos = galleryMedia.filter((item) => item.category === 'Photography');
const projectMedia = featuredProjects.flatMap((project) => project.media);
const brandProjects = featuredProjects.filter((project) => project.category === 'Brand & Digital');
const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const pages = [
  ['/', [heroReel.poster, ...featuredProjects.map((project) => project.cover)]],
  ['/about/', ['/media/photos/tree-final-27.webp']],
  ['/gallery/', [...galleryMedia, ...projectMedia].map(mediaImage)],
  ['/work/film/', [heroReel.poster, ...featuredProjects.filter((project) => project.category === 'Travel Film').map((project) => project.cover)]],
  ['/work/photography/', photos.map((item) => item.src)],
  ['/work/motion/', [featuredProjects[2].cover]],
  ['/work/branding/', brandProjects.flatMap((project) => project.media.filter((item) => item.category === 'Branding').map((item) => item.src))],
  ['/work/graphic/', featuredProjects.filter((project) => project.category === 'Graphic Design').flatMap((project) => project.media.map((item) => item.src))],
  ['/work/digital/', brandProjects.flatMap((project) => project.media.filter((item) => item.category === 'Digital').map((item) => item.src))],
  ['/work/web/', webProjects.filter((project) => project.mark).map((project) => project.mark)],
];

const entries = pages.map(([path, sources]) => {
  const imageEntries = [...new Set(sources.filter(Boolean))]
    .map((src) => `    <image:image><image:loc>${escapeXml(image(src))}</image:loc></image:image>`)
    .join('\n');
  return `  <url>\n    <loc>${base}${path}</loc>${imageEntries ? `\n${imageEntries}` : ''}\n  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join('\n')}\n</urlset>\n`;
writeFileSync(resolve(publicDir, 'sitemap.xml'), xml);
