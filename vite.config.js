import { defineConfig } from 'vite';

export default defineConfig({
  // 以项目根目录为根，register.html 在根目录下直接访问
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: 'index.html',
        register: 'register.html',
        'not-started': 'not-started.html',
        ended: 'ended.html',
      },
    },
  },
});
