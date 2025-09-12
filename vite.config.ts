import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
  },
  // Note: API keys should not be exposed to the browser for security
  // Only expose YouTube API key as it's designed for client-side use
  define: {
    'import.meta.env.VITE_YOUTUBE_API_KEY': JSON.stringify(process.env.YOUTUBE_API_KEY),
  },
});
