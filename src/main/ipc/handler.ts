import { createInvoker } from '@shared/ipc/invoker'
import { ipcMain } from 'electron'

function createIpcListener(
  receiver: object,
): (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any {
  const invoker = createInvoker(receiver)
  return async (_, method: string, ...args: any[]) => {
    return await invoker.invoke(method, ...args)
  }
}

// creates an invoker for the receiver object and registers it as an IPC listener on the given channel
export function registerIpcHandler(channel: string, receiver: object) {
  const listener = createIpcListener(receiver)
  ipcMain.handle(channel, listener)
}
