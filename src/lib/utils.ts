import type {ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";
import {clsx} from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = Nullable<Optional<T>>

export function isNull<T>(value: Nullable<T>): value is null {
  return value === null
}

export function isNotNull<T>(value: Nullable<T>): value is T {
  return value !== null
}

export function isDefined<T>(value: Maybe<T>): value is T {
  return value !== null && value !== undefined
}

export function isNotDefined<T>(value: Maybe<T>): value is null | undefined {
  return !isDefined(value)
}

export function runIf<T>(value: T, predicate: (value: T) => boolean, block: (value: T) => void) {
  if (predicate(value)) {
    block(value)
  }
}

export function takeIf<T>(condition: boolean, value: T): Nullable<T> {
  return condition ? value : null
}