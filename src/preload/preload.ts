// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  electron: {
    getPlatform: () => process.platform,
    setTitleBarColors: (colors: any) =>
      ipcRenderer.send('window:setTitleBarColors', colors),
  },
  service: {
    project: {
      invoke: async (method: string, ...args: any[]) =>
        await ipcRenderer.invoke('service:project', method, ...args),
    },
  },
})
