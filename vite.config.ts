import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsxPlugin from "@vitejs/plugin-vue-jsx";
import vueDevTools from 'vite-plugin-vue-devtools'
import {VitePWA as vitePwa} from "vite-plugin-pwa";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsxPlugin(),
    vueDevTools(),
    vitePwa({
      registerType: 'prompt',
      injectRegister: 'inline',
      strategies: 'generateSW',
      includeAssets: [
        "**/*",
      ],
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        name: 'Time Companion',
        short_name: 'Time Companion',
        description: 'Your time tracking tool.',
        theme_color: '#171717',
        background_color: '#171717',
        display: 'standalone',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'src', 'shared'),
      '@main': path.resolve(__dirname, 'src', 'main'),
      '@preload': path.resolve(__dirname, 'src', 'preload'),
      '@renderer': path.resolve(__dirname, 'src', 'renderer'),
    }
  }
})
