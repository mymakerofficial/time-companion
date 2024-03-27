// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { ProjectDto } from '@shared/model/project'

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  electron: {
    getPlatform: () => process.platform,
    setTitleBarColors: (colors: any) =>
      ipcRenderer.send('window:setTitleBarColors', colors),
  },
  service: {
    project: {
      getProjects: () => ipcRenderer.invoke('service:project:getProjects'),
      createProject: (project: ProjectDto) =>
        ipcRenderer.invoke('service:project:createProject', project),
    },
  },
})
