import { defineConfig } from 'vitest/config';
import path from 'node:path';

const pkgs = path.resolve(__dirname, '../../packages');

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: [
      { find: /^@bitget-sim\/shared$/, replacement: path.join(pkgs, 'shared/src/index.ts') },
      { find: /^@bitget-sim\/shared\/(.*)$/, replacement: path.join(pkgs, 'shared/src/$1') },
      { find: /^@bitget-sim\/engine\/(.*)$/, replacement: path.join(pkgs, 'engine/src/$1') },
      { find: /^@bitget-sim\/market-data\/(.*)$/, replacement: path.join(pkgs, 'market-data/src/$1') },
    ],
  },
});
