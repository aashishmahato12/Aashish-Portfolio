import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pageMarkdown, llmsText, agentInstructions } from '../server/agent-content.js';
import { notFoundHtml } from '../server/not-found-page.js';
for (const [path, content] of Object.entries(pageMarkdown)) {
  const file = `dist${path}index.md`;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}
writeFileSync('dist/llms.txt', llmsText);
writeFileSync('dist/agent-instructions.md', agentInstructions);
writeFileSync('dist/404.html', notFoundHtml);
console.log(`Generated Markdown for ${Object.keys(pageMarkdown).length} pages and agent guidance.`);
