interface Window {
  electronAPI?: {
    isElectron: boolean
    electron: {
      getPlatform: () => string
      setTitleBarColors: (colors: {
        backgroundColor: string
        symbolColor: string
      }) => void
      createNewWindow: () => void
    }
    service: {
      preflight: {
        invoke: (method: string, ...args: any[]) => Promise<any>
        onNotify: (callback: (event: object, topics: object) => void) => void
      }
      project: {
        invoke: (method: string, ...args: any[]) => Promise<any>
        onNotify: (callback: (event: object, topics: object) => void) => void
      }
      task: {
        invoke: (method: string, ...args: any[]) => Promise<any>
        onNotify: (callback: (event: object, topics: object) => void) => void
      }
    }
  }
}
