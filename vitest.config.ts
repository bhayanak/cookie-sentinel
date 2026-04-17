import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/unit/**/*.test.{ts,tsx}'],
    exclude: ['test/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'src/shared/**/*.{ts,tsx}',
        'src/background/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/**/*.html',
        'src/shared/types.ts',
        'src/background/storage-aggregator.ts',
        'src/background/cookie-watcher.ts',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@background': resolve(__dirname, 'src/background'),
      '@devtools': resolve(__dirname, 'src/devtools'),
      '@popup': resolve(__dirname, 'src/popup'),
      '@content': resolve(__dirname, 'src/content'),
      '@data': resolve(__dirname, 'src/data'),
    },
  },
});
