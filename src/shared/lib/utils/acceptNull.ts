import type { Nullable } from '@shared/lib/utils/types'
import { isNull } from '@shared/lib/utils/checks'

type NullableArgs<TArgs extends unknown[]> = {
  [K in keyof TArgs]: TArgs[K] | null
}

/***
 * Turns a function that doesn't accept null values into one that does.
 * @returns A function that accepts null values and returns null if any of the arguments are null.
 */
export function acceptNull<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
): (...args: NullableArgs<TArgs>) => Nullable<TReturn> {
  return (...args) => {
    const hasNull = args.some(isNull)
    if (hasNull) return null
    return fn(...(args as TArgs))
  }
}
