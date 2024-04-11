import { asyncResolveResult } from '@shared/lib/helpers/resulting'

// creates a proxy object that forwards method calls to the invoke function
export function createReceiverProxy<T extends object>(
  invoke: (method: string, ...args: any[]) => Promise<any>,
): T {
  // scary javascript magic
  return new Proxy(
    {},
    {
      get(_, method) {
        return async (...args: any[]) => {
          return await asyncResolveResult(invoke(method as string, ...args))
        }
      },
    },
  ) as T
}
