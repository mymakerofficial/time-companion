// creates a proxy object that forwards method calls to the invoke function
export function createReceiverProxy<T extends object>(
  invoke: (method: string, ...args: any[]) => Promise<any>,
): T {
  // be warned, javascript magic ahead

  return new Proxy(
    {},
    {
      get(_, method) {
        return async (...args: any[]) => await invoke(method as string, ...args)
      },
    },
  ) as T
}
