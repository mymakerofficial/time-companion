import { ipcRenderer } from 'electron'
import {
  serviceInvokeChannel,
  servicePublishChannel,
} from '@shared/ipc/helpers/channels'

export function createServiceApi(service: string) {
  return {
    invoke: async (method: string, ...args: any[]) =>
      await ipcRenderer.invoke(serviceInvokeChannel(service), method, ...args),
    onNotify: (callback: (event: object, topics: object) => void) =>
      ipcRenderer.on(servicePublishChannel(service), (_, event, topics) =>
        callback(event, topics),
      ),
  }
}
