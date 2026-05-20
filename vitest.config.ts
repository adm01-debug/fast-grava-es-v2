import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**', '**/supabase/functions/**'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        'src/test/**',
        'src/**/*.d.ts',
        'src/integrations/**',
      ],
    },
  },
});
