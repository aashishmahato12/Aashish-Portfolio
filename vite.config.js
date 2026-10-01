import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { searchMeta, structuredData } from './src/seo-data.js';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tailwindcss(), {
    name: 'portfolio-identity',
    transformIndexHtml(html, context) {
      const relativeFile = path.relative(root, context.filename).split(path.sep).join('/');
      const route = Object.keys(searchMeta).find((key) => {
        const pagePath = searchMeta[key][2];
        return relativeFile === (pagePath === '/' ? 'index.html' : `${pagePath.slice(1)}index.html`);
      });
      if (!route) return html;
      const clean = html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
      return { html: clean, tags: [
        { tag: 'script', attrs: { id: 'portfolio-structured-data', type: 'application/ld+json' },
          children: JSON.stringify(structuredData(route)).replaceAll('<', '\\u003c'), injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:site_name', content: 'Aashish Mahato' }, injectTo: 'head' },
      ] };
    },
  }],
  build: {
    rollupOptions: {
      input: {
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
      },
    },
  },
  resolve: {
    alias: {
      '@': path.join(root, 'src'),
    },
  },
});
