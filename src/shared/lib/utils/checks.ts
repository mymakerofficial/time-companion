import type { Nullable, ValueOrGetter } from '@shared/lib/utils/types'
import { toValue } from '@shared/lib/utils/result'

export class IllegalStateError extends Error {
  constructor(message: string = 'Illegal state') {
    super(message)
    this.name = 'IllegalStateError'
  }
}

export function check(
  predicate: boolean,
  otherwise?: string | ValueOrGetter<Error> | (() => never),
): asserts predicate {
  if (!predicate) {
    throw isString(otherwise)
      ? new IllegalStateError(otherwise)
      : toValue(otherwise)
  }
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

export function isDefined<T>(value: T): value is Exclude<T, undefined> {
  return value !== undefined
}

export function isNull(value: unknown): value is null {
  return value === null
}

export function isNotNull<T>(value: T): value is Exclude<T, null> {
  return value !== null
}

export function isAbsent(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

export function isPresent<T>(value: T): value is Exclude<T, null | undefined> {
  return value !== null && value !== undefined
}

export function isZeroOrNull(value: Nullable<number>): value is 0 | null {
  return value === 0 || value === null
}

export function isNotZeroOrNull(
  value: Nullable<number>,
): value is Exclude<number, 0 | null> {
  return value !== 0 && value !== null
}

export function isArray<T>(value: Array<T> | any): value is Array<T> {
  return Array.isArray(value)
}

export function isNotArray<T>(value: T): value is Exclude<T, Array<unknown>> {
  return !Array.isArray(value)
}

export function isPromise(value: unknown): value is Promise<unknown> {
  return value instanceof Promise
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isSymbol(value: unknown): value is symbol {
  return typeof value === 'symbol'
}

export function isEmpty(value: unknown): value is null | undefined | '' | [] {
  if (isString(value)) {
    return value.length === 0
  }

  if (isArray(value)) {
    return value.length === 0
  }

  return isAbsent(value)
}

export function isNotEmpty(
  value: unknown,
): value is Exclude<unknown, null | undefined | '' | []> {
  return !isEmpty(value)
}
