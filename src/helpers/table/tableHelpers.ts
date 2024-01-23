import type {Ref} from "vue";
import type {Updater} from "@tanstack/vue-table";

export function updater<T>(updaterOrValue: Updater<T>, value: Ref<T>) {
  value.value =
    typeof updaterOrValue === 'function'
      ? (updaterOrValue as (old: T) => T)(value.value)
      : updaterOrValue
}