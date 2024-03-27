export function firstOf<T extends ReadonlyArray<unknown>>(values: T): T[0] {
  return values[0]
}

export function secondOf<T extends ReadonlyArray<unknown>>(values: T): T[1] {
  return values[1]
}

export function lastOf<T extends ReadonlyArray<unknown>>(values: T): T[number] {
  return values[values.length - 1]
}

export function asArray(value: null): [null]
export function asArray(value: undefined): []
export function asArray<T>(value: T | Array<T>): Array<T>
export function asArray<T>(value: T): Array<T>
export function asArray<T>(value: Array<T>): Array<T>
export function asArray(value: any): Array<any> {
  if (value === null) {
    return [null]
  }

  if (value === undefined) {
    return []
  }

  if (Array.isArray(value)) {
    return value
  }

  return [value]
}

export function setOf<T>(values: Array<T>): Set<T> {
  return new Set(values)
}
