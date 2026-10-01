import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { featuredProjects, galleryMedia, webProjects } from '../src/portfolio-data.js';

import { mediaAlt, mediaDescription } from '../src/media-text.js';
import { creativeBio, officialProfiles } from '../src/seo-data.js';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const link = (href, label) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
const profileLinks = () => officialProfiles.map((profile) => link(profile.url, `Aashish Mahato on ${profile.label}`)).join(' · ');
const thumbnail = (item) => {
  const src = item.type === 'video' ? item.poster : item.src || item.cover;
  return src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(mediaAlt(item))}" loading="lazy" width="320" style="max-width:100%;height:auto"/>` : '';
};
const project = (item, href) => `<li>${thumbnail(item)}<h2>${link(href, item.title)}</h2><p>${escapeHtml(mediaDescription(item) || item.category)}</p></li>`;
const shell = (heading, intro, content) => `<main class="portfolio-fallback"><nav aria-label="Portfolio pages">${link('/', 'Home')}${link('/gallery/', 'Gallery')}${link('/about/', 'About')}</nav><h1>${escapeHtml(heading)}</h1><p class="portfolio-fallback-intro">${escapeHtml(intro)}</p>${content}</main>`;

const groups = [
  ['film', 'Film projects', 'Travel films and moving images by Aashish Mahato.', [{ id: 'showreel', title: 'Current showreel', category: 'Film', description: 'A moving overview of my visual work.' }, ...featuredProjects.filter((item) => item.category === 'Travel Film')]],
  ['photography', 'Photography portfolio', 'Portraits, places, and moments photographed by Aashish Mahato.', galleryMedia.filter((item) => item.category === 'Photography')],
  ['motion', 'Motion graphics', 'Animated visuals and moving-image work by Aashish Mahato.', featuredProjects.filter((item) => item.category === 'Motion Graphics')],
  ['branding', 'Branding projects', 'Identity and brand presentation work by Aashish Mahato.', featuredProjects.filter((item) => item.category === 'Brand & Digital')],
  ['graphic', 'Graphic design projects', 'Campaign and social graphics by Aashish Mahato.', featuredProjects.filter((item) => item.category === 'Graphic Design')],
  ['digital', 'Digital projects', 'Interface and digital product concepts by Aashish Mahato.', featuredProjects.filter((item) => item.category === 'Brand & Digital')],
  ['web', 'Web development projects', 'Websites and web applications built by Aashish Mahato.', webProjects],
];

const combinedGallery = [...galleryMedia, ...featuredProjects.flatMap((project) => project.media.map((item, index) => ({ ...item, id: item.id || `${project.id}-${index}` })))];
const uniqueGallery = combinedGallery.filter((item, index) => combinedGallery.findIndex((other) => other.src === item.src) === index);

const routes = new Map([
  ['index.html', shell('Aashish Mahato', creativeBio, `<p>${profileLinks()}</p><section><h2>Explore my work</h2><ul>${groups.map(([slug, label]) => `<li>${link(`/work/${slug}/`, label)}</li>`).join('')}</ul></section><section><h2>Selected projects</h2><ul>${featuredProjects.map((item) => project(item, `/work/${item.category === 'Travel Film' ? 'film' : item.category === 'Motion Graphics' ? 'motion' : item.category === 'Graphic Design' ? 'graphic' : 'branding'}/#${item.id}`)).join('')}</ul></section>`)],
  ['about/index.html', shell('About Aashish Mahato', creativeBio, `<section><h2>My approach</h2><p>A film can become a photograph. A visual identity can become a digital experience. I refine each project until it meets the client's expectations and my own.</p><p>${link('/#my-work', 'See my skills and selected projects')}</p><p>${profileLinks()}</p></section>`)],
  ['gallery/index.html', shell('Gallery of films, photography, and design', 'Explore the visual archive of Aashish Mahato.', `<section><h2>Films, photographs, and designs</h2><ul>${uniqueGallery.map((item) => `<li>${thumbnail(item)}${link(`/gallery/#gallery-item-${item.id}`, `${item.title} — ${item.category}`)}<p>${escapeHtml(mediaDescription(item))}</p></li>`).join('')}</ul></section><p>${link('/work/graphic/', 'See graphic design projects')} · ${link('/work/branding/', 'See branding projects')}</p>`)],
]);

for (const [slug, label, intro, items] of groups) {
  routes.set(`work/${slug}/index.html`, shell(label, intro, `<section><h2>Selected work</h2><ul>${items.map((item) => project(item, `/work/${slug}/#${item.id}`)).join('')}</ul></section><p>${link('/gallery/', 'Browse the full gallery')} · ${link('/#my-work', 'Explore other skills')}</p>`));
}

const style = `<style>.portfolio-fallback{min-height:100vh;padding:clamp(24px,6vw,96px);background:#0d1210;color:#f5f2eb;font:16px/1.6 Arial,sans-serif}.portfolio-fallback nav{display:flex;gap:24px;flex-wrap:wrap}.portfolio-fallback a{color:inherit;text-underline-offset:4px}.portfolio-fallback h1{font-size:clamp(40px,8vw,100px);line-height:1.05;max-width:1100px;margin:16vh 0 20px}.portfolio-fallback-intro{font-size:clamp(18px,2vw,26px);max-width:760px}.portfolio-fallback section{margin-top:80px;max-width:960px}.portfolio-fallback ul{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}.portfolio-fallback li{border-top:1px solid #ffffff50;padding-top:14px}.portfolio-fallback li h2{font-size:20px;margin:0}.portfolio-fallback li p{margin:6px 0 0;color:#d2d8cf}</style>`;

for (const [page, content] of routes) {
  const file = resolve(dist, page);
  const html = readFileSync(file, 'utf8');
  const root = '<div id="root"></div>';
  if (!html.includes(root)) throw new Error(`Missing app root in ${page}`);
  writeFileSync(file, html.replace('</head>', `${style}</head>`).replace(root, `<div id="root">${content}</div>`));
}

console.log(`Added readable page content to ${routes.size} built pages.`);
