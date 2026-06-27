import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  preview: {
    host: "127.0.0.1",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && visualizer({
      filename: 'dist/bundle-report.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
      sourcemap: false,
      title: 'Fast Gravações — Bundle Report',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    // Strip console + debugger in production builds (keep warn/error for diagnostics)
    drop: mode === 'production' ? ['debugger'] : [],
    pure: mode === 'production' ? ['console.log', 'console.debug', 'console.info'] : [],
    legalComments: 'none',
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Granular chunking: keep eager bundle small and let heavy/feature-specific
        // libraries load only when the routes that use them mount.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          // React core stays in the eager vendor bundle (always needed)
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router-dom/') ||
            id.includes('/react-router/') ||
            id.includes('/scheduler/')
          ) {
            return 'vendor-react';
          }

          // TanStack Query (used by nearly every page) — small, keep eager
          if (id.includes('@tanstack/react-query')) return 'vendor-query';

          // Supabase client (eager via auth/realtime providers)
          if (id.includes('@supabase/')) return 'vendor-supabase';

          // ── Heavy dashboard-only libs: dynamic chunks, loaded on-demand ──
          if (id.includes('/recharts/') || id.includes('/d3-')) return 'lib-charts';
          if (id.includes('/mermaid/') || id.includes('/cytoscape')) return 'lib-mermaid';
          if (id.includes('/exceljs/') || id.includes('/jszip/') || id.includes('/file-saver/')) return 'lib-excel';
          if (id.includes('/jspdf')) return 'lib-pdf';
          if (id.includes('/html2canvas/')) return 'lib-html2canvas';
          if (id.includes('/html5-qrcode/') || id.includes('/qrcode.react/')) return 'lib-qrcode';
          if (id.includes('/react-joyride/') || id.includes('/react-floater/')) return 'lib-joyride';
          if (id.includes('/canvas-confetti/')) return 'lib-confetti';
          if (id.includes('/react-markdown/') || id.includes('/remark-') || id.includes('/micromark') || id.includes('/mdast') || id.includes('/unified/') || id.includes('/hast') || id.includes('/vfile')) return 'lib-markdown';
          if (id.includes('/embla-carousel')) return 'lib-carousel';

          // Animation: heavy, but used by every page through PageTransition → keep
          // as a separate chunk so it's cached independently from feature libs
          if (id.includes('/framer-motion/') || id.includes('/motion-')) return 'vendor-motion';

          // Radix UI primitives — used app-wide but large; own chunk for caching
          if (id.includes('@radix-ui/')) return 'vendor-radix';

          // Icons — used everywhere, keep separate for long-term caching
          if (id.includes('/lucide-react/')) return 'vendor-icons';

          // i18n
          if (id.includes('/i18next') || id.includes('/react-i18next/')) return 'vendor-i18n';

          // Forms + validation
          if (id.includes('/react-hook-form/') || id.includes('/@hookform/') || id.includes('/zod/')) return 'vendor-forms';

          // Date/util micro-libs
          if (id.includes('/date-fns/') || id.includes('/clsx/') || id.includes('/tailwind-merge/') || id.includes('/class-variance-authority/')) return 'vendor-utils';

          // DnD
          if (id.includes('/@dnd-kit/')) return 'vendor-dnd';

          // Sentry — defer cost to its own chunk
          if (id.includes('@sentry/')) return 'vendor-sentry';

          // Fallback: leave Rollup's default grouping for everything else
          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
    // Exclude heavy libs that should not be pre-bundled (loaded lazily)
    exclude: ['mermaid', 'exceljs', 'jspdf', 'html2canvas', 'jszip'],
  },
}));
