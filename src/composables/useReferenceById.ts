import type {Ref, WatchSource, WritableComputedRef} from "vue";
import type {HasId, ID} from "@/lib/types";
import {computed, reactive, ref, watch} from "vue";
import type {Maybe, Nullable} from "@/lib/utils";
import {isDefined, isNull} from "@/lib/utils";

/**
 * Returns a writable computed object from the provided collection, referenced by its id.
 *
 * @param collectionSource the collection to search in, can be a ref, watchable source or plain array
 * @param idSource the id to reference, this must be a watchable source. If not provided, the reference will be null and can be set later with the `referenceBy()` method. It is not recommended to use both `idSource` and `referenceBy()`, since the two values will get out of sync.
 */
export function useReferenceById<T extends HasId>(collectionSource: WatchSource<Maybe<T[]>> | T[], idSource?: WatchSource<Nullable<ID>>) {
  const collection = ref<T[]>([]) as Ref<T[]>
  const id = ref<Nullable<ID>>()

  if (Array.isArray(collectionSource)) {
    collection.value = collectionSource
  } else {
    watch(collectionSource, (newCollection) => {
      if (isDefined(newCollection)) {
        collection.value = newCollection
      } else {
        collection.value = []
      }
    }, {immediate: true})
  }

  function referenceBy(newId: Nullable<ID>) {
    id.value = newId
  }

  if (isDefined(idSource)) {
    watch(idSource, referenceBy, {immediate: true})
  }

  const value = computed<Nullable<T>>({
    get() {
      return collection.value.find(it => it.id === id.value) || null
    },
    set(value) {
      if (isNull(value)) {
        id.value = null
        return
      }

      if (value.id !== id.value) {
        throw Error('Tried to change the id of a referenced by id object.')
      }

      const index = collection.value.findIndex(it => it.id === id.value)
      collection.value[index] = value
    }
  }) as WritableComputedRef<Nullable<T>> & {
    /**
     * changes the id of the referenced object
     * @param newId
     */
    referenceBy: typeof referenceBy
  }

  Object.defineProperty(value, 'referenceBy', {
    value: referenceBy,
    writable: false,
    enumerable: false,
    configurable: false,
  })

  return value
}