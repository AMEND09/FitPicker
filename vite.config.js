import { defineConfig } from 'vite'

export default defineConfig({
  base: '/FitPicker/',  // Updated to match the correct repo/directory name
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          return `assets/${info[0]}.[hash].${ext}`
        },
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  }
})
