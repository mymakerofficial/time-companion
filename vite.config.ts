import { Connect, defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA as vitePwa } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'
import { type ServerResponse } from 'node:http'

function crossOriginIsolationMiddleware(
  _req: Connect.IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
) {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
  next()
}

const crossOriginIsolation: Plugin = {
  name: 'cross-origin-isolation',
  configureServer: (server) => {
    server.middlewares.use(crossOriginIsolationMiddleware)
  },
  configurePreviewServer: (server) => {
    server.middlewares.use(crossOriginIsolationMiddleware)
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ['@electric-sql/pglite', '@sqlite.org/sqlite-wasm'],
  },
  plugins: [
    crossOriginIsolation,
    tsconfigPaths(),
    vue(),
    vueJsx(),
    vueDevTools(),
    vitePwa({
      registerType: 'prompt',
      injectRegister: 'inline',
      strategies: 'generateSW',
      includeAssets: ['**/*'],
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000,
      },
      devOptions: {
        enabled: false,
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
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
