import { next } from '@vercel/functions';
import { agentResponse } from './server/agent-response.js';
export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!assets/|media/|videos/|_vercel/|favicon.png|robots.txt|sitemap.xml).*)'],
};
export default function middleware(request) {
  return agentResponse(request) || next({ headers: { Vary: 'Accept', Link: '</llms.txt>; rel="describedby"' } });
}
