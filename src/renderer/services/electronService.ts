import { createService } from '@renderer/composables/createService'

export interface ElectronService {
  readonly isElectron: boolean
  getPlatform: () => null | string
  setTitleBarColors: (colors: {
    backgroundColor: string
    symbolColor: string
  }) => void
}

export const useElectronService = createService<ElectronService>(() => {
  const isElectron = !!window.electronAPI?.isElectron

  return {
    isElectron,
    getPlatform: () =>
      isElectron ? window.electronAPI!.electron.getPlatform() : null,
    setTitleBarColors: (colors) => {
      if (isElectron) {
        window.electronAPI!.electron.setTitleBarColors(colors)
      }
    },
  }
})
