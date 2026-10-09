import { searchMeta } from '../src/seo-data.js';
const base = (process.argv[2] || 'https://aashish-mahato.com.np').replace(/\/$/, '');
const checks = [];
async function check(path, accept, status, type, validate = () => true) {
  try {
    const response = await fetch(base + path, { headers: { Accept: accept }, signal: AbortSignal.timeout(15000) });
    const body = await response.text();
    const vary = response.headers.get('vary') || '';
    const passed = response.status === status && (type === 'application/xml' ? /^(?:application|text)\/xml/.test(response.headers.get('content-type') || '') : (response.headers.get('content-type') || '').startsWith(type)) && body.length > 20 && validate(body) && (type !== 'text/markdown' || /(?:^|,)\s*Accept\s*(?:,|$)/i.test(vary));
    checks.push({ path, accept, passed, status: response.status, contentType: response.headers.get('content-type'), vary, characters: body.length });
  } catch (error) { checks.push({ path, accept, passed: false, error: error.message }); }
}
for (const [, , path] of Object.values(searchMeta)) {
  await check(path, 'text/markdown', 200, 'text/markdown', body => /^# /m.test(body));
  await check(path, 'text/html', 200, 'text/html', body => /<html/i.test(body));
  await check(path + 'index.md', '*/*', 200, 'text/markdown');
}
await check('/__agent_readiness_missing_page', 'text/markdown', 404, 'text/markdown', body => /\[.*\]\(.*(?:llms.txt|sitemap.xml)/.test(body));
await check('/llms.txt', '*/*', 200, 'text/markdown', body => /^# .+\n\n> /.test(body) && /## When to use/.test(body));
await check('/agent-instructions.md', '*/*', 200, 'text/markdown', body => /When to use/.test(body));
await check('/sitemap.xml', '*/*', 200, 'application/xml', body => /<urlset/.test(body));
await check('/robots.txt', '*/*', 200, 'text/plain', body => /Sitemap:/.test(body));
console.log(JSON.stringify({ base, checkedAt: new Date().toISOString(), passed: checks.filter(c => c.passed).length, total: checks.length, checks }, null, 2));
if (checks.some(c => !c.passed)) process.exitCode = 1;
