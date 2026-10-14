import { videoPages } from './src/video-pages.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { agentReadinessPlugin } from './server/vite-agent-plugin.js';
import { searchMeta, searchImages, searchImageAlts, siteUrl, structuredData } from './src/seo-data.js';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [agentReadinessPlugin(), {
    name: 'portfolio-identity',
    transformIndexHtml(html, context) {
      const relativeFile = path.relative(root, context.filename).split(path.sep).join('/');
      const route = Object.keys(searchMeta).find((key) => {
        const pagePath = searchMeta[key][2];
        return relativeFile === (pagePath === '/' ? 'index.html' : `${pagePath.slice(1)}index.html`);
      });
      if (!route) return html;
      const clean = html.replace(/<title>[\s\S]*?<\/title>/gi, '').replace(/<meta\b[^>]*(?:name=["'](?:description|robots|twitter:[^"']*)["']|property=["']og:[^"']*["'])[^>]*>/gi, '').replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, '').replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
      const [title, description, pagePath] = searchMeta[route];
      const video = videoPages.find(item => item.route === route);
      return { html: clean, tags: [
        { tag: 'link', attrs: { rel: 'describedby', href: '/llms.txt' }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'alternate', type: 'text/markdown', href: `${pagePath}index.md` }, injectTo: 'head' },
        { tag: 'title', children: title, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'robots', content: 'index, follow, max-image-preview:large' }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}${pagePath}` }, injectTo: 'head' },
        ...Object.entries({ type: 'website', url: `${siteUrl}${pagePath}`, title, description, image: new URL(searchImages[route], siteUrl).href }).map(([key, content]) => ({ tag: 'meta', attrs: { property: `og:${key}`, content }, injectTo: 'head' })),
        ...(video ? [{ tag: 'meta', attrs: { property: 'og:video', content: video.playerUrl || video.media.src }, injectTo: 'head' }, { tag: 'meta', attrs: { property: 'og:video:type', content: video.playerUrl ? 'text/html' : 'video/mp4' }, injectTo: 'head' }] : []),
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:image', content: new URL(searchImages[route], siteUrl).href }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:title', content: title }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:description', content: description }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: searchImageAlts[route] }, injectTo: 'head' },
        { tag: 'script', attrs: { id: 'portfolio-structured-data', type: 'application/ld+json' },
          children: JSON.stringify(structuredData(route)).replaceAll('<', '\\u003c'), injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:site_name', content: 'Aashish Mahato' }, injectTo: 'head' },
      ] };
    },
  }],
  build: {
    rollupOptions: {
      input: {
        ...Object.fromEntries(videoPages.map(video => [video.route, path.join(root, video.path.slice(1), 'index.html')])),
        home: path.join(root, 'index.html'),
        work: path.join(root, 'work/index.html'),
        film: path.join(root, 'work/film/index.html'),
        photography: path.join(root, 'work/photography/index.html'),
        motion: path.join(root, 'work/motion/index.html'),
        branding: path.join(root, 'work/branding/index.html'),
        graphic: path.join(root, 'work/graphic/index.html'),
        digital: path.join(root, 'work/digital/index.html'),
        web: path.join(root, 'work/web/index.html'),
        gallery: path.join(root, 'gallery/index.html'),
        about: path.join(root, 'about/index.html'),
        contact: path.join(root, 'contact/index.html'),
        privacy: path.join(root, 'privacy/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.join(root, 'src'),
    },
  },
});
