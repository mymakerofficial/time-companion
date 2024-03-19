import { computed, type WritableComputedRef } from 'vue'

export function bindReadonly<T extends object, K extends keyof T>(
  state: T,
  prop: K,
): WritableComputedRef<T[K]> {
  return computed(() => state[prop])
}

export function mapReadonly<T extends object, K extends (keyof T)[]>(
  state: T,
  props: K,
): { [P in K[number]]: WritableComputedRef<T[P]> } {
  const result: any = {}
  for (const prop of props) {
    result[prop] = bindReadonly(state, prop)
  }
  return result
}

export function bindWritable<T extends object, K extends keyof T>(
  state: T,
  prop: K,
): WritableComputedRef<T[K]> {
  return computed({
    get() {
      return state[prop]
    },
    set(value) {
      state[prop] = value
    },
  })
}

export function mapWritable<T extends object, K extends (keyof T)[]>(
  state: T,
  props: K,
): { [P in K[number]]: WritableComputedRef<T[P]> } {
  const result: any = {}
  for (const prop of props) {
    result[prop] = bindWritable(state, prop)
  }
  return result
}
