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

export function randomElements<T>(
  list: ReadonlyArray<T>,
  count: number,
  options: RandomElementOptions = {},
): Array<T> {
  const { safetyOffset = 0 } = options

  check(count <= list.length, 'Cannot select more elements than the list has')

  const result = new Set<T>()

  while (result.size < count) {
    result.add(randomElement(list, { safetyOffset }))
  }

  return Array.from(result)
}
