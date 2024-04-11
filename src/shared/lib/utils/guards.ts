import type { MaybePromise } from '@shared/lib/utils/types'
import { isPromise } from '@shared/lib/utils/checks'

export function ensurePromise<T>(value: MaybePromise<T>): Promise<T> {
  if (isPromise(value)) {
    return value
  }

  return Promise.resolve(value)
}
