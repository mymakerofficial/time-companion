import { createInvoker } from '@main/ipc/invoker'

// creates an IPC listener that forwards method calls to the receiver object
export function createIpcListener(
  receiver: object,
): (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any {
  const invoker = createInvoker(receiver)
  return async (_, method: string, ...args: any[]) => {
    return await invoker.invoke(method, ...args)
  }
}
