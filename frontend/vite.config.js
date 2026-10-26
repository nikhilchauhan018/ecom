import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  // API phase: proxy keeps cookies same-site in dev
  // server: { proxy: { '/api': 'http://localhost:4000' } },
});
