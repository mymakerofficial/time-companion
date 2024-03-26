import { check } from '@shared/lib/utils/checks'

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export interface RandomElementOptions {
  // e.g. if 1, will exclude the first and last elements
  safetyOffset?: number
}

export function randomElement<T>(
  list: ReadonlyArray<T>,
  options: RandomElementOptions = {},
): T {
  const { safetyOffset = 0 } = options

  check(safetyOffset >= 0, 'Padding must be a non-negative number')
  check(
    safetyOffset < list.length,
    'Padding must be less than the length of the list',
  )

  return list[randomInt(safetyOffset, list.length - 1 - safetyOffset)]
}
