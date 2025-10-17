import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        'popup/popup': resolve(__dirname, 'src/popup/popup.ts'),
        'options/options': resolve(__dirname, 'src/options/options.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        format: 'es',
        manualChunks(id, { getModuleInfo }) {
          const importers = getModuleInfo(id)?.importers || [];
          if (importers.length === 0) {
            return null;
          }
          // no special handling
          return false;
        },
        inlineDynamicImports: false,
      },
    },
    minify: false,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '.' },
        { src: 'src/popup/index.html', dest: 'popup' },
        { src: 'src/options/index.html', dest: 'options' },
        { src: 'src/content/styles.css', dest: 'content' },
        { src: 'assets/*', dest: 'assets' },
      ],
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        global: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
      },
    },
  },
});

