import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Add type declarations for process.env
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_YOUTUBE_API_KEY?: string;
      YOUTUBE_API_KEY?: string;
    }
  }
}

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
    // This allows the YouTube API key to be accessed in the client code
    // It will use VITE_YOUTUBE_API_KEY from .env file during development
    // and YOUTUBE_API_KEY from Vercel environment variables in production
    'import.meta.env.VITE_YOUTUBE_API_KEY': JSON.stringify(process.env.VITE_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY),
  },
});
