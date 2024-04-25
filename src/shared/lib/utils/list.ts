import { isArray } from '@shared/lib/utils/checks'

export function firstOf<T extends ReadonlyArray<unknown>>(values: T): T[0] {
  return values[0]
}

export function excludeFirst<T extends ReadonlyArray<unknown>>(
  values: T,
): T extends [unknown, ...infer U] ? U : never {
  return values.slice(1) as any
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

  if (isArray(value)) {
    return value
  }

  return [value]
}

export function toArray<T>(value: Iterable<T> | ArrayLike<T>): Array<T> {
  return Array.from(value)
}

export function asSet<T>(value: Iterable<T>): Set<T> {
  return new Set(value)
}

export function setOf<T>(values: Array<T>): Set<T> {
  return new Set(values)
}

export function mapOf<K, V>(entries: Array<[K, V]>): Map<K, V> {
  return new Map(entries)
}

export function emptyArray<T>(): Array<T> {
  return []
}

export function emptySet<T>(): Set<T> {
  return new Set()
}

export function emptyMap<K, V>(): Map<K, V> {
  return new Map()
}

// returns true if the arrays have at least one element in common
export function arraysHaveOverlap<T>(a: Array<T>, b: Array<T>): boolean {
  return a.some((value) => b.includes(value))
}
