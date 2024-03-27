export class IllegalStateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IllegalStateError'
  }
}

export function check(predicate: boolean, message: string): asserts predicate {
  if (!predicate) {
    throw new IllegalStateError(message)
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

export function isArray<T>(value: Array<T> | any): value is Array<T> {
  return Array.isArray(value)
}

export function isNotArray<T>(value: T): value is Exclude<T, Array<unknown>> {
  return !Array.isArray(value)
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}
