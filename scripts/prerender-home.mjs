import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { createServer as createHttpServer } from 'node:http';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

// Deliver the real first screen before JavaScript, then hydrate the same tree.
const server = await createServer({
  server: { middlewareMode: true, hmr: { server: createHttpServer() } },
  ssr: { noExternal: ['gsap', 'motion', 'radix-ui', '@vercel/analytics', '@vercel/speed-insights'] },
});
try {
  const { default: Root } = await server.ssrLoadModule('/src/Root.jsx');
  const content = renderToString(createElement(Root));
  if (!content.includes('id="hero-title"') || content.includes('Switched to client rendering')) {
    throw new Error('Homepage prerender did not finish.');
  }
  const file = 'dist/index.html';
  const html = readFileSync(file, 'utf8');
  const start = html.indexOf('<div id="root">');
  // The readable fallback has one outer root; replace through its closing tag.
  const fallbackEnd = html.indexOf('</main></div>', start);
  if (start < 0 || fallbackEnd < 0) throw new Error('Homepage fallback root not found.');
  writeFileSync(file, html.slice(0, start) + `<div id="root" data-ssr="home">${content}</div>` + html.slice(fallbackEnd + '</main></div>'.length));
  console.log('Prerendered and hydrated the complete homepage.');
} finally {
  await server.close();
}
