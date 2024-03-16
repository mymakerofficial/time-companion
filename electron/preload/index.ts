import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  setTitleBarColors: (colors) => ipcRenderer.send('set-title-bar-colors', colors),
  platform: process.platform
})