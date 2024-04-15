import { type ConfigEnv, type UserConfig, defineConfig } from 'vite'
import { pluginExposeRenderer } from './vite.base.config'
import viteConfig from './vite.config'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>
  const { root, mode, forgeConfigSelf } = forgeEnv
  const name = forgeConfigSelf.name ?? ''

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [pluginExposeRenderer(name), ...(viteConfig.plugins ?? [])],
    resolve: {
      preserveSymlinks: true,
      alias: viteConfig.resolve?.alias,
    },
    clearScreen: false,
  } as UserConfig
})
