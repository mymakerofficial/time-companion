/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
  electronAPI?: {
    isElectron: boolean
    setTitleBarColors: (colors: { backgroundColor: string, symbolColor: string }) => void
    platform: NodeJS.Platform
  }
}