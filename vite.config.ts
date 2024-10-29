import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './src/app/index.ts',
      },
      output: {
        dir: 'static/js',
        entryFileNames: 'index.js',
      },
    },
  },
});
