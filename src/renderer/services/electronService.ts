import { createService } from '@renderer/composables/createService'

export interface ElectronService {
  readonly isElectron: boolean
  readonly platform:
    | null
    | 'aix'
    | 'android'
    | 'darwin'
    | 'freebsd'
    | 'haiku'
    | 'linux'
    | 'openbsd'
    | 'sunos'
    | 'win32'
    | 'cygwin'
    | 'netbsd'
  setTitleBarColors: (colors: {
    backgroundColor: string
    symbolColor: string
  }) => void
}

export const useElectronService = createService<ElectronService>(() => {
  const isElectron = !!window.electronAPI?.isElectron

  return {
    isElectron,
    platform: isElectron ? window.electronAPI!.platform : null,
    setTitleBarColors: (colors) => {
      if (isElectron) {
        window.electronAPI!.setTitleBarColors(colors)
      }
    },
  }
})
