import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { preview } from 'vite';
import { searchMeta, siteUrl } from '../src/seo-data.js';
import { pageMarkdown, llmsText, agentInstructions } from '../server/agent-content.js';
import { chooseRepresentation, agentResponse } from '../server/agent-response.js';
import middleware from '../middleware.js';

test('HTTP Accept quality values, exclusions, wildcards and HTML default', () => {
  for (const [accept, expected] of [
    [undefined, 'text/html'], ['*/*', 'text/html'], ['text/*', 'text/html'],
    ['text/markdown', 'text/markdown'], ['TEXT/MARKDOWN', 'text/markdown'],
    ['text/markdown;q=0, text/html', 'text/html'], ['text/markdown;q=0, */*;q=1', 'text/html'],
    ['text/html;q=0.2, text/markdown;q=0.9', 'text/markdown'],
    ['text/markdown;q=0.2, text/html;q=0.9', 'text/html'],
    ['text/html;q=0, text/markdown;q=0', undefined], ['application/json', undefined],
    ['text/markdown;q=0.5, */*;q=0.1', 'text/markdown'],
  ]) assert.equal(chooseRepresentation(accept), expected, String(accept));
});

test('Vercel middleware preserves static delivery and marks HTML variants', () => {
  for (const path of ['/media/videos/mustang.mp4', '/assets/main.js', '/robots.txt', '/sitemap.xml', '/_vercel/insights/script.js']) {
    assert.equal(agentResponse(new Request(siteUrl + path)), null);
  }
  const html = middleware(new Request(siteUrl, { headers: { accept: 'text/html' } }));
  assert.equal(html.headers.get('x-middleware-next'), '1');
  assert.equal(html.headers.get('vary'), 'Accept');
  assert.match(html.headers.get('link'), /llms.txt/);
});

test('built discovery files follow llms.txt structure and point to real outputs', () => {
  assert.equal(readFileSync('dist/llms.txt', 'utf8'), llmsText);
  assert.equal(readFileSync('dist/agent-instructions.md', 'utf8'), agentInstructions);
  assert.match(llmsText, /^# Aashish Mahato\n\n> /);
  for (const section of llmsText.split(/^## /m).slice(1)) {
    assert.ok(section.split('\n').slice(1).filter(s => s.trim()).every(s => /^- \[[^\]]+\]\(https:\/\//.test(s)), 'H2 sections must be file lists');
  }
  assert.match(agentInstructions, /When to use/);
  assert.match(agentInstructions, /no booking, payment, or messaging API/);
  for (const [, url] of llmsText.matchAll(/\]\((https:[^)]+)\)/g)) {
    assert.ok(existsSync('dist' + new URL(url).pathname), url);
  }
  for (const name of ['about', 'contact', 'privacy']) {
    const html = readFileSync(`dist/${name}/index.html`, 'utf8');
    const text = html.match(/<main[\s\S]*?<\/main>/)[0].replace(/<[^>]*>/g, '');
    assert.ok(text.length >= 500, `${name}: readable content too short`);
  }
  assert.match(readFileSync('src/SiteChrome.jsx', 'utf8'), /href="\/privacy\/"/);
  assert.match(readFileSync('src/Experience.jsx', 'utf8'), /privacy: PrivacyPage/);
});

test('every built public page and machine file is served correctly over HTTP', async () => {
  const server = await preview({ preview: { host: '127.0.0.1', port: 0, open: false } });
  const base = `http://127.0.0.1:${server.httpServer.address().port}`;
  const get = (path, accept, method = 'GET') => fetch(base + path, { method, headers: { Accept: accept } });
  try {
    for (const path of Object.values(searchMeta).map(meta => meta[2])) {
      const md = await get(path, 'text/markdown');
      assert.equal(md.status, 200, path);
      assert.match(md.headers.get('content-type'), /^text\/markdown/);
      assert.match(md.headers.get('vary'), /Accept/);
      assert.equal(await md.text(), pageMarkdown[path]);
      const html = await get(path, 'text/html');
      assert.equal(html.status, 200, path);
      assert.match(html.headers.get('content-type'), /^text\/html/);
      assert.match(html.headers.get('vary'), /Accept/);
      assert.match(await html.text(), /<html/);
      const explicit = await get(path + 'index.md', '*/*');
      assert.equal(explicit.status, 200);
      assert.match(explicit.headers.get('content-type'), /^text\/markdown/);
      assert.equal(await explicit.text(), pageMarkdown[path]);
      for (const alias of [path + 'index.html', ...(path !== '/' ? [path.slice(0, -1)] : [])]) {
        const response = await get(alias, 'text/markdown');
        assert.equal(response.status, 200, alias);
        assert.equal(await response.text(), pageMarkdown[path]);
      }
    }
    for (const path of ['/missing-agent-probe', '/does/not/exist/', '/unknown.txt', '/missing/index.md']) {
      const md = await get(path, 'text/markdown');
      assert.equal(md.status, 404);
      assert.match(md.headers.get('content-type'), /^text\/markdown/);
      const body = await md.text();
      assert.ok(body.length > 20);
      assert.match(body, /\[llms.txt\]\(/);
    }
    const html404 = await get('/missing-agent-probe', 'text/html');
    assert.equal(html404.status, 404);
    assert.match(await html404.text(), /404/);
    const head = await get('/', 'text/markdown', 'HEAD');
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    const unsupported = await get('/', 'application/json');
    assert.equal(unsupported.status, 406);
    for (const path of ['/llms.txt', '/agent-instructions.md', '/sitemap.xml', '/robots.txt']) {
      const result = await get(path, '*/*');
      assert.equal(result.status, 200, path);
      assert.ok((await result.text()).length > 20);
    }
    const media = await fetch(base + '/media/videos/mustang.mp4', { headers: { Range: 'bytes=0-31' } });
    assert.equal(media.status, 206);
    assert.equal((await media.arrayBuffer()).byteLength, 32);
    const favicon = await get('/favicon.png', 'image/png');
    assert.equal(favicon.status, 200);
    assert.match(favicon.headers.get('content-type'), /^image\/png/);
  } finally {
    await new Promise(resolve => server.httpServer.close(resolve));
  }
});
