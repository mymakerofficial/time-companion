import type {ComputedRef, MaybeRefOrGetter} from "vue";
import {computed} from "vue";
import type {MaybeReadonly, Optional} from "@/lib/utils";
import {toValue} from "@vueuse/core"

/**
 * Reactive `Array.find`
 */
export function useGetFrom<T>(
  list: MaybeRefOrGetter<MaybeReadonly<Array<MaybeRefOrGetter<T>>>>,
  fn: (element: T, index: number, array: MaybeReadonly<Array<MaybeRefOrGetter<T>>>) => boolean,
): ComputedRef<Optional<T>> {
  return computed(() => {
    return toValue<Optional<T>>(
      toValue(list)
        .find((element, index, array) => fn(toValue(element), index, array)),
    )
  })
}