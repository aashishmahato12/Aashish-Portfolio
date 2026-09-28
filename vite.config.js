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
