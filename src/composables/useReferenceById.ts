import type {WatchSource, WritableComputedRef} from "vue";
import type {HasId, ID} from "@/lib/types";
import {computed, ref, watch} from "vue";
import type {Nullable} from "@/lib/utils";
import {isDefined, isNull} from "@/lib/utils";

export function useReferenceById<T extends HasId>(collection: T[], idSource?: WatchSource<Nullable<ID>>) {
  const id = ref<Nullable<ID>>()

  function referenceBy(newId: Nullable<ID>) {
    id.value = newId
  }

  if (idSource) {
    watch(idSource, referenceBy, {immediate: true})
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
    value: (newValue: Nullable<ID>) => {
      if (isDefined(idSource)) {
        throw Error('Tried to use referenceBy on a reference by id object that is referenced by a watch source.')
      }

      referenceBy(newValue)
    },
    writable: false,
    enumerable: false,
    configurable: false,
  })

  return value
}