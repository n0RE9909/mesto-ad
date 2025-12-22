import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    open: true,
    port: 3000,
    headers: {
      "Content-Security-Policy": "default-src 'self' 'unsafe-inline' 'unsafe-eval';"
    }
  }
});