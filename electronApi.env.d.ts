interface Window {
  electronAPI?: {
    isElectron: boolean
    electron: {
      getPlatform: () => string
      setTitleBarColors: (colors: {
        backgroundColor: string
        symbolColor: string
      }) => void
    }
    service: {
      project: {
        invoke: (method: string, ...args: any[]) => Promise<any>
      }
    }
  }
}
