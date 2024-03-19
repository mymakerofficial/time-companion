export type SingletonFactoryFn<
  TArgs extends Array<unknown>,
  TRes extends object,
> = (...args: TArgs) => TRes

export function createSingleton<
  TArgs extends Array<unknown>,
  TRes extends object,
>(factory: SingletonFactoryFn<TArgs, TRes>): (...args: TArgs) => TRes {
  let instance: TRes | null = null

  return (...args: TArgs) => {
    if (instance === null) {
      instance = factory(...args)
    }

    return instance
  }
}
