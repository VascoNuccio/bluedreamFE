import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Bluedream',
        short_name: 'Bluedream',
        start_url: '/',
        display: 'standalone',
        background_color: '#33066f',
        theme_color: '#32acdc',
        icons: [
          {
            src: 'bluedream.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],
    build: {
    outDir: 'build' // ← questa è la cartella che verrà generata
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
