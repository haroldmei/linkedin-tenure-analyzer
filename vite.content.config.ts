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
    emptyOutDir: false,
    rollupOptions: {
      input: {
        'content/analyzer': resolve(__dirname, 'src/content/analyzer.ts'),
      },
      output: {
        format: 'iife',
        entryFileNames: '[name].js',
        inlineDynamicImports: true,
      },
    },
    minify: false,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'src/content/styles.css', dest: 'content' },
      ],
    }),
  ],
});


