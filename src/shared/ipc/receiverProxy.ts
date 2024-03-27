export function createReceiverProxy<T extends object>(
  invoke: (method: string, ...args: any[]) => Promise<any>,
): T {
  return new Proxy(
    {},
    {
      get: (_, method) => {
        return async (...args: any[]) => await invoke(method as string, ...args)
      },
    },
  ) as T
}
