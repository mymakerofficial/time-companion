export function firstOf<T extends Array<unknown>>(values: T): T[0] {
  return values[0]
}

export function asArray(value: null): [null]
export function asArray(value: undefined): []
export function asArray<T>(value: T | Array<T>): Array<T>
export function asArray<T>(value: T): Array<T>
export function asArray<T>(value: Array<T>): Array<T>
export function asArray(value: any): Array<any> {
  if (value === null) {
    return [null]
  }

  if (value === undefined) {
    return []
  }

  if (Array.isArray(value)) {
    return value
  }

  return [value]
}
