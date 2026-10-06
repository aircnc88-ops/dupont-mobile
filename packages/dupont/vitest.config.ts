import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Package-local vitest config so the root config's explicit include list
// (owned by other packages) does not need to change.
export default defineConfig({
  root: __dirname,
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
  },
  resolve: {
    alias: {
      '@bitget-sim/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
});
