// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  setTitleBarColors: (colors: any) =>
    ipcRenderer.send('set-title-bar-colors', colors),
  platform: process.platform,
})
