import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tailwindcss()],
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
