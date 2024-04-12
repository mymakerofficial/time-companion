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

// Returns the value if present and doesn't throw, otherwise returns the value returned by the getter.
export function getOrElse<T>(
  valueOrGetter: ValueOrGetter<Maybe<T>>,
  elseValueOrGetter: ValueOrGetter<T>,
): T {
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
): T {
  return getOrElse(valueOrGetter, () => {
    throw toError(errorOrMessage)
  })
}

// Returns the value if present and doesn't throw, otherwise returns the default value.
export function getOrDefault<T>(
  valueOrGetter: ValueOrGetter<Maybe<T>>,
  defaultValue: T,
): T {
  return getOrElse(toValue(valueOrGetter), defaultValue)
}

// Returns the value if it is defined and doesn't throw, otherwise returns null.
export function getOrNull<T>(
  valueOrGetter: ValueOrGetter<Optional<T>>,
): Nullable<T> {
  return getOrDefault(toValue(valueOrGetter), null)
}

// Returns the value if present and doesn't throw, otherwise returns the value returned by the getter.
export async function asyncGetOrElse<T>(
  valueOrGetter: ValueOrGetter<Promise<Maybe<T>>>,
  elseValueOrGetter: ValueOrGetter<T>,
): Promise<T> {
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
): Promise<T> {
  return asyncGetOrElse(valueOrGetter, () => {
    throw toError(errorOrMessage)
  })
}

// Returns the value if present and doesn't throw, otherwise returns the default value.
export async function asyncGetOrDefault<T>(
  valueOrGetter: ValueOrGetter<Promise<Maybe<T>>>,
  defaultValue: T,
): Promise<T> {
  return asyncGetOrElse(toValue(valueOrGetter), defaultValue)
}

// Returns the value if it is defined and doesn't throw, otherwise returns null.
export async function asyncGetOrNull<T>(
  valueOrGetter: ValueOrGetter<Promise<Optional<T>>>,
): Promise<Nullable<T>> {
  return asyncGetOrDefault(toValue(valueOrGetter), null)
}
