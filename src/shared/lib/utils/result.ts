import type {
  ErrorOrString,
  Maybe,
  Nullable,
  Optional,
  ValueOrGetter,
} from '@shared/lib/utils/types'
import { isFunction, isPresent, isString } from '@shared/lib/utils/checks'

// Returns the value or gets the value from the getter.
export function toValue<T>(valueOrGetter: ValueOrGetter<T>): T {
  return isFunction(valueOrGetter) ? valueOrGetter() : valueOrGetter
}

// Returns the error or creates a new error with the message.
export function toError(errorOrMessage: Error | string): Error {
  return isString(errorOrMessage) ? new Error(errorOrMessage) : errorOrMessage
}

// Runs the function with the arguments and returns the result or the value.
export function getOrRun<T>(
  valueOrFunction: T | ((...args: any[]) => T),
  ...args: any[]
): T {
  return isFunction(valueOrFunction)
    ? valueOrFunction(...args)
    : valueOrFunction
}

// Returns the value if present and doesn't throw, otherwise returns the value returned by the getter.
export function getOrElse<T, G = T>(
  valueOrGetter: ValueOrGetter<Maybe<T>>,
  elseValueOrGetter: ValueOrGetter<G>,
): Exclude<T, null | undefined> | G {
  try {
    const value = toValue(valueOrGetter)
    if (isPresent(value)) {
      return value
    }
  } catch {}

  return toValue(elseValueOrGetter)
}

// Returns the value if present and doesn't throw, otherwise throws an error.
export function getOrThrow<T>(
  valueOrGetter: ValueOrGetter<Maybe<T>>,
  errorOrMessage: ErrorOrString,
): Exclude<T, null | undefined> {
  return getOrElse(valueOrGetter, () => {
    throw toError(errorOrMessage)
  })
}

// Returns the value if present and doesn't throw, otherwise returns the default value.
export function getOrDefault<T, G = T>(
  valueOrGetter: ValueOrGetter<Maybe<T>>,
  defaultValue: G,
): Exclude<T, null | undefined> | G {
  return getOrElse(toValue(valueOrGetter), defaultValue)
}

// Returns the value if it is defined and doesn't throw, otherwise returns null.
export function getOrNull<T>(
  valueOrGetter: ValueOrGetter<Optional<T>>,
): Nullable<T> {
  return getOrDefault(toValue(valueOrGetter), null)
}

// Returns the value if present and doesn't throw, otherwise returns the value returned by the getter.
export async function asyncGetOrElse<T, G = T>(
  valueOrGetter: ValueOrGetter<Promise<Maybe<T>>>,
  elseValueOrGetter: ValueOrGetter<G>,
): Promise<Exclude<T, null | undefined> | G> {
  try {
    const value = await toValue(valueOrGetter)
    if (isPresent(value)) {
      return value
    }
  } catch {}
  return toValue(elseValueOrGetter)
}

// Returns the value if present and doesn't throw, otherwise throws an error.
export async function asyncGetOrThrow<T>(
  valueOrGetter: ValueOrGetter<Promise<Maybe<T>>>,
  errorOrMessage: ErrorOrString,
): Promise<Exclude<T, null | undefined>> {
  return asyncGetOrElse(valueOrGetter, () => {
    throw toError(errorOrMessage)
  })
}

// Returns the value if present and doesn't throw, otherwise returns the default value.
export async function asyncGetOrDefault<T, G = T>(
  valueOrGetter: ValueOrGetter<Promise<Maybe<T>>>,
  defaultValue: G,
): Promise<Exclude<T, null | undefined> | G> {
  return asyncGetOrElse(toValue(valueOrGetter), defaultValue)
}

// Returns the value if it is defined and doesn't throw, otherwise returns null.
export async function asyncGetOrNull<T>(
  valueOrGetter: ValueOrGetter<Promise<Optional<T>>>,
): Promise<Nullable<T>> {
  return asyncGetOrDefault(toValue(valueOrGetter), null)
}
