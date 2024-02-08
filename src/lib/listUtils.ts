import type {Maybe, MaybeArray} from "@/lib/utils";
import {isDefined, isNotDefined, isNull} from "@/lib/utils";

export function isArray<T>(value: Maybe<MaybeArray<T>>): value is T[] {
  return Array.isArray(value)
}

export function isNotArray<T>(value: Maybe<MaybeArray<T>>): value is Maybe<T> {
  return !isArray(value)
}

// if given an array, returns true if the array is empty, if not given an array, returns true if the value is null or undefined
export function isEmpty<T>(value: Maybe<MaybeArray<T>>): value is Maybe<[]> {
  if (isNotArray(value)) {
    return isNotDefined(value)
  }

  return isNotDefined(value) || value.length === 0
}

// if given an array, returns true if the array is not empty, if not given an array, returns true if the value is not null or undefined
export function isNotEmpty<T>(value: Maybe<MaybeArray<T>>): value is [T, ...T[]] {
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
export function asArray<T>(value: Maybe<MaybeArray<T>>): T[] {
  if (isNull(value)) {
    return [null] as T[]
  }

  if (isNotDefined(value)) {
    return []
  }

  if (isArray(value)) {
    return value
  }

  return [value]
}

// if given an array, returns the first element, if given a single value, returns that value
export function firstOf<T>(value: Maybe<MaybeArray<T>>): Maybe<T> {
  if (isEmpty(value)) {
    return null
  }

  if (isNotArray(value)) {
    return value
  }

  return value[0]
}

// if given an array, returns the last element, if given a single value, returns that value
export function lastOf<T>(value: Maybe<MaybeArray<T>>): Maybe<T> {
  if (isEmpty(value)) {
    return null
  }

  if (isNotArray(value)) {
    return value
  }

  return value[value.length - 1]
}