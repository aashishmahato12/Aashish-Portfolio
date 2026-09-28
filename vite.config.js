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
        main: path.join(root, 'index.html'),
        projects: path.join(root, 'projects/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.join(root, 'src'),
    },
  },
});
