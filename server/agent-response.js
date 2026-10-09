import Negotiator from 'negotiator';
import { pageMarkdown, llmsText, agentInstructions, notFoundMarkdown } from './agent-content.js';
export function canonicalPage(path) {
  const normalized = path.replace(/\/index\.html$/, '/');
  return normalized.endsWith('/') ? normalized : normalized + '/';
}
export function isStaticRequest(path) {
  return /^\/(?:assets|media|videos|_vercel|@vite|@id|@fs|src|node_modules)(?:\/|$)/.test(path) || path === '/favicon.png' || path === '/robots.txt' || path === '/sitemap.xml';
}
export function chooseRepresentation(accept) {
  return new Negotiator({ headers: { ...(accept == null ? {} : { accept }) } }).mediaType(['text/html', 'text/markdown']);
}
export function agentResponse(request) {
  const path = new URL(request.url).pathname;
  if (isStaticRequest(path)) return null;
  if (!['GET', 'HEAD'].includes(request.method)) return null;
  const headers = { 'Content-Type': 'text/markdown; charset=utf-8', 'Vary': 'Accept', 'Cache-Control': 'no-store', 'Link': '</llms.txt>; rel="describedby"' };
  const respond = (body, status = 200) => new Response(request.method === 'HEAD' ? null : body, { status, headers });
  if (path === '/llms.txt') return respond(llmsText);
  if (path === '/agent-instructions.md') return respond(agentInstructions);
  if (path.endsWith('/index.md')) {
    const content = pageMarkdown[path.slice(0, -8)];
    return respond(content || notFoundMarkdown, content ? 200 : 404);
  }
  const representation = chooseRepresentation(request.headers.get('accept'));
  const content = pageMarkdown[canonicalPage(path)];
  if (!representation) {
    headers['Content-Type'] = 'text/plain; charset=utf-8';
    return respond('Not acceptable. Request text/html or text/markdown.\n', 406);
  }
  if (representation === 'text/markdown') return respond(content || notFoundMarkdown, content ? 200 : 404);
  if (!content) {
    headers['Content-Type'] = 'text/html; charset=utf-8';
    return respond('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | Aashish Mahato</title><body style="background:#111;color:white;font:18px/1.6 system-ui;padding:8vw"><h1>404 — Page not found</h1><p>This page does not exist.</p><a style="color:#e34530" href="/">Home</a> · <a style="color:#e34530" href="/work/">Work</a></body></html>', 404);
  }
  return null;
}
