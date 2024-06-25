import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = Nullable<Optional<T>>

export type MaybeArray<T> = T | Array<T>
export type MaybeFunction<T> = T | ((...args: any[]) => T)
export type MaybeReadonly<T> = T | Readonly<T>

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

export function runIf<T>(
  value: T,
  predicate: (value: T) => boolean,
  block: (value: T) => void,
) {
  if (predicate(value)) {
    block(value)
  }
}

export function isCallable(
  maybeFunction: unknown | ((...args: any[]) => any),
): maybeFunction is (...args: any[]) => void {
  return typeof maybeFunction === 'function'
}

export function getOrRun<T>(valueOrFunction: MaybeFunction<T>): T {
  return isCallable(valueOrFunction) ? valueOrFunction() : valueOrFunction
}

export function round(value: number, precision: number = 0): number {
  if (precision <= 0) {
    return Math.floor(value)
  }

  const factor = Math.pow(10, precision)
  return Math.floor(value * factor) / factor
}

export function fillZero(value: number, length: number = 2): string {
  return value.toString().padStart(length, '0')
}

export class IllegalStateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IllegalStateError'
  }
}

export function check(predicate: boolean, message: string) {
  if (!predicate) {
    throw new IllegalStateError(message)
  }
}
