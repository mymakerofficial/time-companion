import type { Pair } from '@shared/lib/utils/types'

export function entriesOf<T extends unknown>(obj: T) {
  return Object.entries(obj as object) as Array<Pair<keyof T, T[keyof T]>>
}

export function keysOf<T extends unknown>(obj: T) {
  return Object.keys(obj as object) as Array<keyof T>
}

export function valuesOf<T extends unknown>(obj: T) {
  return Object.values(obj as object) as Array<T[keyof T]>
}

export function propertiesOf<T extends unknown>(obj: T) {
  return Object.getOwnPropertyNames(
    Object.getPrototypeOf(obj as object),
  ).filter((p) => p !== 'constructor') as Array<keyof T>
}

export function objectFromEntries<T extends unknown>(
  entries: Array<Pair<keyof T, T[keyof T]>>,
) {
  return Object.fromEntries(entries) as T
}

export function assignProperties<T extends object, G extends object>(
  target: T,
  source: G,
): T & G {
  return Object.assign(
    target,
    objectFromEntries(propertiesOf(source).map((key) => [key, source[key]])),
  )
}
