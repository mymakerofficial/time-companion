import type { ConfigEnv, UserConfig } from 'vite'
import { defineConfig, mergeConfig } from 'vite'
import {
  external,
  getBuildConfig,
  getBuildDefine,
  pluginHotRestart,
} from './vite.base.config'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import viteConfig from './vite.config'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'build'>
  const define = getBuildDefine(forgeEnv)

  const config: UserConfig = {
    build: {
      lib: {
        entry: path.join(__dirname, 'src', 'main', 'main.ts'),
        fileName: () => '[name].js',
        formats: ['cjs'],
      },
      rollupOptions: {
        external,
      },
    },
    optimizeDeps: viteConfig.optimizeDeps,
    plugins: [pluginHotRestart('restart'), tsconfigPaths()],
    define,
    resolve: {
      // Load the Node.js entry.
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
  }

  return mergeConfig(getBuildConfig(forgeEnv), config)
})
