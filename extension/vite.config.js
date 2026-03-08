import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Copy manifest as-is; background.js is bundled via rollupOptions below
    {
      name: 'copy-extension-files',
      closeBundle() {
        mkdirSync('dist', { recursive: true })
        copyFileSync('public/manifest.json', 'dist/manifest.json')
      },
    },
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // Dashboard React app (at root so Vite outputs dist/dashboard.html)
        dashboard: resolve(__dirname, 'dashboard.html'),
        // Background service worker — bundled as ES module
        background: resolve(__dirname, 'src/background/index.js'),
      },
      output: {
        // Place the background bundle at dist/background.js (no hash)
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js'
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
