import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const pkgs = path.resolve(__dirname, '../../packages');

// Same-origin proxy for Bitget PUBLIC REST (fallback if direct CORS fetch fails, e.g. via tunnel).
const bitgetProxy = {
  '/bgapi': {
    target: 'https://api.bitget.com',
    changeOrigin: true,
    secure: true,
    rewrite: (p: string) => p.replace(/^\/bgapi/, ''),
  },
};

// Static GitHub Pages build (MOBILE_CDN=1): React + lightweight-charts load from esm.sh via an
// import map so the deployed bundle is tiny text (pushable through the GitHub connector).
const CDN = process.env.MOBILE_CDN === '1';
const IMPORT_MAP = {
  imports: {
    react: 'https://esm.sh/react@18.3.1',
    'react/jsx-runtime': 'https://esm.sh/react@18.3.1/jsx-runtime',
    'react-dom/client': 'https://esm.sh/react-dom@18.3.1/client?deps=react@18.3.1',
    'lightweight-charts': 'https://esm.sh/lightweight-charts@4.2.0',
    'decimal.js': 'https://esm.sh/decimal.js@10.6.0',
  },
};
const cdnPlugin = {
  name: 'dupont-cdn-importmap',
  transformIndexHtml(html: string) {
    return html.replace('<head>', `<head>\n    <script type="importmap">${JSON.stringify(IMPORT_MAP)}</script>`);
  },
};

export default defineConfig({
  // '/' for KSHUN dev/preview on :5174; '/dupont-mobile/' for the GitHub Pages build (MOBILE_BASE env)
  base: process.env.MOBILE_BASE || '/',
  plugins: CDN ? [react(), cdnPlugin] : [react()],
  resolve: {
    alias: [
      // Deep (sub-path) imports into package sources — reuse without touching package code.
      { find: /^@bitget-sim\/dupont$/, replacement: path.join(pkgs, 'dupont/src/index.ts') },
      { find: /^@bitget-sim\/shared$/, replacement: path.join(pkgs, 'shared/src/index.ts') },
      { find: /^@bitget-sim\/shared\/(.*)$/, replacement: path.join(pkgs, 'shared/src/$1') },
      { find: /^@bitget-sim\/engine\/(.*)$/, replacement: path.join(pkgs, 'engine/src/$1') },
      { find: /^@bitget-sim\/market-data\/(.*)$/, replacement: path.join(pkgs, 'market-data/src/$1') },
    ],
  },
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    allowedHosts: true,
    proxy: bitgetProxy,
  },
  preview: {
    port: 5174,
    strictPort: true,
    host: true,
    allowedHosts: true,
    proxy: bitgetProxy,
  },
  // Pages build: wrap minified output at ~160 cols so the bundle is pushable/diffable as plain text
  esbuild: CDN ? { lineLimit: 160, charset: 'ascii' } : undefined,
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
    rollupOptions: CDN ? { external: Object.keys(IMPORT_MAP.imports) } : {},
  },
});
