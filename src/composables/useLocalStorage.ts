import {isNull} from "@/lib/utils";

export function useLocalStorage<T>(key: string, defaultValue: T) {
  function set(value: T): T {
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

  get()

  return {
    get,
    set,
  }
}