import type { Maybe, MaybeArray, MaybeReadonly } from '@renderer/lib/utils'
import { isDefined, isNotDefined, isNull } from '@renderer/lib/utils'
import type { HasId, ID } from '@renderer/lib/types'
import { isSameDay } from '@renderer/lib/neoTime'
import { Temporal } from 'temporal-polyfill'

export function isArray<T>(
  value: Maybe<MaybeReadonly<MaybeArray<T>>>,
): value is T[] {
  return Array.isArray(value)
}

export function isNotArray<T>(
  value: Maybe<MaybeReadonly<MaybeArray<T>>>,
): value is Maybe<T> {
  return !isArray(value)
}

// if given an array, returns true if the array is empty, if not given an array, returns true if the value is null or undefined
export function isEmpty<T>(
  value: Maybe<MaybeReadonly<MaybeArray<T>>>,
): value is Maybe<[]> {
  if (typeof value === 'string') {
    return value.length === 0
  }

  if (isNotArray(value)) {
    return isNotDefined(value)
  }

  return isNotDefined(value) || value.length === 0
}

// if given an array, returns true if the array is not empty, if not given an array, returns true if the value is not null or undefined
export function isNotEmpty<T>(
  value: Maybe<MaybeReadonly<MaybeArray<T>>>,
): value is [T, ...T[]] {
  if (typeof value === 'string') {
    return value.length > 0
  }

  if (isNotArray(value)) {
    return isDefined(value)
  }

  return isDefined(value) && value.length > 0
}

// if given an array, returns the sum of all values, if given an empty array, returns 0
export function sumOf(values: Maybe<number[]>): number {
  if (isEmpty(values)) {
    return 0
  }

  return values.reduce((acc, value) => acc + value, 0)
}

// if given an array, returns the array, if given a single value, returns an array with that value
export function asArray<T>(value: Maybe<MaybeReadonly<MaybeArray<T>>>): T[] {
  if (isNull(value)) {
    return [null] as T[]
  }

  if (isNotDefined(value)) {
    return []
  }

  if (isArray(value)) {
    return value
  }

  return [value as T]
}

// if given an array, returns the first element, if given a single value, returns that value
export function firstOf<T>(
  value: Maybe<MaybeReadonly<MaybeArray<T>>>,
): Maybe<T> {
  if (isEmpty(value)) {
    return null
  }

  if (isNotArray(value)) {
    return value
  }

  return value[0]
}

// if given an array, returns second element, if given a single value, returns that value
export function secondOf<T>(
  value: Maybe<MaybeReadonly<MaybeArray<T>>>,
): Maybe<T> {
  if (isEmpty(value)) {
    return null
  }

  if (isNotArray(value)) {
    return value
  }

  if (value.length < 2) {
    return null
  }

  return value[1]
}

// if given an array, returns the last element, if given a single value, returns that value
export function lastOf<T>(
  value: Maybe<MaybeReadonly<MaybeArray<T>>>,
): Maybe<T> {
  if (isEmpty(value)) {
    return null
  }

  if (isNotArray(value)) {
    return value
  }

  return value[value.length - 1]
}

// returns a predicate function that checks if the id of the given object is equal to the given id
export function whereId<T extends HasId>(id: Maybe<ID>) {
  if (isNotDefined(id)) {
    return () => false
  }

  return (it: T) => it.id === id
}

export function whereDate<T extends { date: Temporal.PlainDate }>(
  date: Maybe<Temporal.PlainDate>,
) {
  if (isNotDefined(date)) {
    return () => false
  }

  return (it: T) => isSameDay(it.date, date)
}

export function whereDisplayName<T extends { displayName: string }>(
  displayName: Maybe<string>,
) {
  if (isNotDefined(displayName)) {
    return () => false
  }

  return (it: T) => it.displayName === displayName
}
