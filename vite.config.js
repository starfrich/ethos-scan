import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/index.ts'),
        popup: resolve(__dirname, 'src/popup/popup.html')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'content' ? 'content.js' : '[name].js';
        },
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].js',
        format: 'iife',
        manualChunks: (id) => {
          if (id.includes('src/content') || id.includes('src/shared') || id.includes('src/api')) {
            return 'content';
          }
        }
      }
    }
  }
});
