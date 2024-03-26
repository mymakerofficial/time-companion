export function firstOf<T>(list: Array<T>): T {
  return list[0]
}

export function lastOf<T>(list: Array<T>): T {
  return list[list.length - 1]
}
