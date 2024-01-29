import type {Maybe, MaybeArray} from "@/lib/utils";
import {isDefined, isNotDefined} from "@/lib/utils";

export function isEmpty<T>(array: Maybe<T[]>): array is Maybe<[]> {
  return isNotDefined(array) || array.length === 0
}

export function isNotEmpty<T>(array: Maybe<T[]>): array is [T, ...T[]] {
  return isDefined(array) && array.length > 0
}

export function sumOf(values: Maybe<number[]>): number {
  if (isEmpty(values)) {
    return 0
  }

  return values.reduce((acc, value) => acc + value, 0)
}

// if given an array, returns the array, if given a single value, returns an array with that value
export function asArray<T>(value: Maybe<MaybeArray<T>>): T[] {
  if (isNotDefined(value)) {
    return []
  }

  if (Array.isArray(value)) {
    return value
  }

  return [value]
}

export function firstOf<T>(values: Maybe<T[]>): Maybe<T> {
  if (isEmpty(values)) {
    return null
  }

  return values[0]
}

export function lastOf<T>(values: Maybe<T[]>): Maybe<T> {
  if (isEmpty(values)) {
    return null
  }

  return values[values.length - 1]
}