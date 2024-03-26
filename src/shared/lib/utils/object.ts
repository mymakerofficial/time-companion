import type { Pair } from '@shared/lib/utils/types'

export function entriesOf<T extends unknown>(obj: T) {
  return Object.entries(obj as object) as Array<Pair<keyof T, T[keyof T]>>
}

export function keysOf<T extends unknown>(obj: T) {
  return Object.keys(obj as object) as Array<keyof T>
}
