import { videoPages } from '../src/video-pages.js';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { searchMeta, siteUrl, searchImages, searchProjects } from '../src/seo-data.js';
import { contactEmail } from '../src/contact-enquiry.js';

// Check the actual published HTML, including content available without JavaScript.
const titles = new Set();
const descriptions = new Set();
const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
const robots = readFileSync('dist/robots.txt', 'utf8');
assert.match(robots, /User-agent: \*\s+Allow: \//);
assert.ok(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`));
assert.doesNotMatch(robots, /Disallow:\s*\/(?:\s|$)/);
for (const [route, [title, description, path]] of Object.entries(searchMeta)) {
  const file = `dist${path}index.html`;
  assert.ok(existsSync(file), `${route}: missing built page`);
  const html = readFileSync(file, 'utf8');
  const decode = value => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
  const builtTitles = [...html.matchAll(/<title>(.*?)<\/title>/g)];
  assert.equal(builtTitles.length, 1, `${route}: title count`);
  assert.equal(decode(builtTitles[0][1]), title);
  const desc = html.match(/<meta name="description" content="([^"]*)"/)[1];
  assert.equal(decode(desc), description);
  assert.ok(!titles.has(title) && !descriptions.has(description), `${route}: duplicate metadata`);
  titles.add(title); descriptions.add(description);
  assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1);
  assert.ok(html.includes(`rel="canonical" href="${siteUrl}${path}"`));
  assert.ok(sitemap.includes(`<loc>${siteUrl}${path}</loc>`), `${route}: absent from sitemap`);
  assert.doesNotMatch(html, /noindex|http-equiv="refresh"/i);
  assert.match(html, /name="robots" content="index, follow/);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${route}: readable primary heading`);
  for (const main of ['work', 'gallery', 'about', 'contact']) {
    assert.ok(html.includes(`href="/${main}/"`), `${route}: missing ${main} link`);
  }
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
  assert.equal(schemas.length, 1);
  const graph = JSON.parse(schemas[0][1])['@graph'];
  assert.ok(graph.some(item => item['@type'] === 'Person'));
  assert.ok(graph.some(item => item['@type'] === 'WebSite'));
  assert.ok(graph.some(item => item.url === `${siteUrl}${path}` && item['@id'].endsWith('#webpage')));
  assert.ok(!searchImages[route].startsWith('/') || existsSync(`dist${searchImages[route]}`), `${route}: missing search preview image`);
  assert.ok(html.includes(`property="og:image" content="${new URL(searchImages[route], siteUrl).href}"`), `${route}: stale share image`);
  assert.ok(html.includes(`name="twitter:image" content="${new URL(searchImages[route], siteUrl).href}"`), `${route}: stale social card image`);
  const webpage = graph.find(item => item['@id'] === `${siteUrl}${path}#webpage`);
  const primaryImage = graph.find(item => item['@id'] === webpage.primaryImageOfPage['@id']);
  assert.equal(primaryImage.contentUrl, new URL(searchImages[route], siteUrl).href, `${route}: primary image does not match preview`);
  if (route.startsWith('video-')) {
    const video = videoPages.find(item => item.route === route);
    assert.ok(html.includes(video.playerUrl ? `<iframe src="${video.playerUrl}"` : `<video controls playsinline preload="metadata"`), `${route}: video is missing from initial HTML`);
    assert.ok(html.includes(video.playerUrl || video.media.src), `${route}: wrong video source`);
    assert.ok(sitemap.includes(`<video:title>${escapeHtml(video.title)}</video:title>`), `${route}: missing video sitemap metadata`);
  }
  if (route === 'contact') assert.ok(html.includes(contactEmail), 'Contact email must be present in readable HTML');
  if (route.startsWith('skill-')) {
    const list = graph.find(item => item['@type'] === 'ItemList');
    assert.equal(list.itemListElement.length, searchProjects(route).length);
    for (const entry of list.itemListElement) {
      assert.ok(html.includes(escapeHtml(entry.item.name)), `${route}: schema project missing from readable content`);
      assert.ok(!entry.item.image.includes('/https://'), `${route}: malformed project image URL`);
      const imageUrl = new URL(entry.item.image);
      if (imageUrl.origin === siteUrl) assert.ok(existsSync(`dist${imageUrl.pathname}`), `${route}: missing project image`);
    }
  }
  for (const [, href] of html.matchAll(/<a\b[^>]*href="(\/[^"#?]*)/g)) {
    assert.ok(existsSync(`dist${href.endsWith('/') ? href + 'index.html' : href}`), `${route}: broken internal link ${href}`);
  }
}
assert.equal([...sitemap.matchAll(/<video:video>/g)].length, videoPages.length);
assert.equal([...sitemap.matchAll(/<loc>/g)].length, Object.keys(searchMeta).length);
console.log(`SEO checks passed: ${titles.size} crawlable pages, unique metadata, canonical URLs, navigation, schema, sitemap, and robots.txt.`);

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
