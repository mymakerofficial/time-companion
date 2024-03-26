export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomElement<T>(list: Array<T>): T {
  return list[randomInt(0, list.length - 1)]
}
