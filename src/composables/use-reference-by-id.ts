import type {WritableComputedRef} from "vue";
import type {HasId, ID} from "@/lib/types";
import {computed, ref} from "vue";
import type {Nullable} from "@/lib/utils";
import {isNull} from "@/lib/utils";

export function useReferenceById<T extends HasId>(collection: T[]) {
  const id = ref<Nullable<ID>>(null)

  function referenceBy(newId: Nullable<ID>) {
    id.value = newId
  }

  const value = computed<Nullable<T>>({
    get() {
      return collection.find(it => it.id === id.value) || null
    },
    set(value) {
      if (isNull(value)) {
        id.value = null
        return
      }

      if (value.id !== id.value) {
        throw Error('Tried to change the id of a referenced by id object.')
      }

      const index = collection.findIndex(it => it.id === id.value)
      collection[index] = value
    }
  }) as WritableComputedRef<Nullable<T>> & { referenceBy: typeof referenceBy }

  Object.defineProperty(value, 'referenceBy', {
    value: referenceBy,
    writable: false,
    enumerable: false,
    configurable: false,
  })

  return value
}