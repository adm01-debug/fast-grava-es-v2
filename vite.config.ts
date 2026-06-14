import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // `vite preview` (used by the Playwright e2e webServer) defaults to port 4173
  // and inherits server.host ("::"); pin it to 127.0.0.1:8080 so it matches the
  // e2e baseURL (http://localhost:8080) and the webServer port readiness check.
  preview: {
    host: "127.0.0.1",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-slot', 'lucide-react', 'recharts', 'framer-motion'],
          utils: ['date-fns', 'zod', 'clsx', 'tailwind-merge'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
  },
}));
