import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { searchMeta, siteUrl } from '../src/seo-data.js';

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
  for (const [, href] of html.matchAll(/<a\b[^>]*href="(\/[^"#?]*)/g)) {
    assert.ok(existsSync(`dist${href.endsWith('/') ? href + 'index.html' : href}`), `${route}: broken internal link ${href}`);
  }
}
assert.equal([...sitemap.matchAll(/<loc>/g)].length, Object.keys(searchMeta).length);
console.log(`SEO checks passed: ${titles.size} crawlable pages, unique metadata, canonical URLs, navigation, schema, sitemap, and robots.txt.`);
