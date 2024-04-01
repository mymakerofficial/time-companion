// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

function getServiceApi(service: string) {
  return {
    invoke: async (method: string, ...args: any[]) =>
      await ipcRenderer.invoke(`service:${service}:invoke`, method, ...args),
    onNotify: (callback: (topics: object, event: object) => void) =>
      ipcRenderer.on(`service:${service}:notify`, (_, topics, event) =>
        callback(topics, event),
      ),
  }
}

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  electron: {
    getPlatform: () => process.platform,
    setTitleBarColors: (colors: any) =>
      ipcRenderer.send('window:setTitleBarColors', colors),
  },
  service: {
    project: {
      ...getServiceApi('project'),
    },
    task: {
      ...getServiceApi('task'),
    },
  },
})
