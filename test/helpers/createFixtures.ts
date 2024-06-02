import { isDefined, isSymbol, isUndefined } from '@shared/lib/utils/checks'
import { getOrRun } from '@shared/lib/utils/result'

type FixtureFn<T, K extends keyof T> = (context: Omit<T, K>) => T[K]

type Fixtures<T extends Record<string, any>> = {
  [K in keyof T]: FixtureFn<T, K> | T[K]
}

// be sure to use the object destructuring syntax to make sure only used fixtures are instantiated
export function createFixtures<T extends Record<string, any> = {}>(
  fixtures: Fixtures<T>,
): () => T {
  const resolvedFixtures: Partial<T> = {}

  const context = new Proxy(
    {},
    {
      get: (_, key) => {
        if (isSymbol(key)) {
          return undefined
        }

        if (isDefined(fixtures[key])) {
          if (isUndefined(resolvedFixtures[key])) {
            resolvedFixtures[key as keyof T] = getOrRun(fixtures[key], context)
          }

          return resolvedFixtures[key]
        }

        return undefined
      },
    },
  ) as T

  return () => context
}
