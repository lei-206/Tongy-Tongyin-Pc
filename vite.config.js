import { defineConfig } from 'vite';

export default defineConfig({
  // 以项目根目录为根，register.html 在根目录下直接访问
  root: '.',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: 'index.html',
        register: 'register.html',
        'not-started': 'not-started.html',
        ended: 'ended.html',
        course: 'course.html',
        'course-first': 'course-first.html',
        login: 'login.html',
        'forget-password': 'forget-password.html',
        'my-courses': 'my-courses.html',
      },
    },
  },
});
