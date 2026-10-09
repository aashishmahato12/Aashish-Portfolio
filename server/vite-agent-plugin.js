import { agentResponse, isStaticRequest } from './agent-response.js';
export function agentReadinessPlugin() {
  const install = server => { server.middlewares.use(async (req, res, next) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (isStaticRequest(path)) return next();
    const request = new Request(new URL(req.url, 'http://localhost'), { method: req.method, headers: req.headers });
    const response = agentResponse(request);
    if (!response) { res.setHeader('Vary', 'Accept'); return next(); }
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  }); };
  return { name: 'portfolio-agent-readiness', configureServer: install, configurePreviewServer: install };
}
