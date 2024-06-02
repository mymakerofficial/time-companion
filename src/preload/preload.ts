// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { createServiceApi } from '@preload/helpers/createServiceApi'

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  electron: {
    getPlatform: () => process.platform,
    setTitleBarColors: (colors: any) =>
      ipcRenderer.send('window:setTitleBarColors', colors),
    createNewWindow: () => ipcRenderer.send('window:createNewWindow'),
  },
  service: {
    project: {
      ...createServiceApi('project'),
    },
    task: {
      ...createServiceApi('task'),
    },
    preflight: {
      ...createServiceApi('preflight'),
    },
  },
})
