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
    // Copy background service worker and manifest as-is (no bundling)
    {
      name: 'copy-extension-files',
      closeBundle() {
        mkdirSync('dist', { recursive: true })
        copyFileSync('src/background/index.js', 'dist/background.js')
        copyFileSync('public/manifest.json', 'dist/manifest.json')
      },
    },
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, 'public/dashboard.html'),
      },
    },
  },
})
