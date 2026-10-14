import Negotiator from 'negotiator';
import { pageMarkdown, llmsText, agentInstructions, notFoundMarkdown } from './agent-content.js';
import { notFoundHtml } from './not-found-page.js';
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
  if (/^\/work\/digital(?:\/(?:index\.(?:html|md))?)?\/?$/.test(path)) {
    const url = new URL(request.url);
    const target = `/work/ui-ux/${path.endsWith('/index.md') ? 'index.md' : ''}${url.search}${url.hash}`;
    return new Response(null, { status: 308, headers: { Location: target } });
  }
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
    return respond(notFoundHtml, 404);
  }
  return null;
}
