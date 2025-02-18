import { defineConfig } from 'vite'

export default defineConfig({
  base: 'https://amend09.github.io/',  // Use absolute URL for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js',
        manualChunks: undefined
      }
    }
  }
})
