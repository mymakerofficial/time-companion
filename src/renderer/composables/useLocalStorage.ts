import { isNotDefined, isNull } from '@renderer/lib/utils'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  function set(value?: T): T {
    if (isNotDefined(value)) {
      return set(defaultValue)
    }

    localStorage.setItem(key, JSON.stringify(value))
    return value
  }

  function get(): T {
    const value = localStorage.getItem(key)

    if (isNull(value)) {
      return set(defaultValue)
    }

    return JSON.parse(value) as T
  }

  function clear() {
    localStorage.removeItem(key)
  }

  return {
    get,
    set,
    clear,
  }
}
