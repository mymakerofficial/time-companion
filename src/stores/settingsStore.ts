import {defineStore} from "pinia";
import {useLocalStorage} from "@/composables/useLocalStorage";
import type {Nullable} from "@/lib/utils";
import {customRef, type Ref, unref} from "vue";

interface SettingsStorageSerialized {
  values: {
    locale: string,
    theme: string,
    normalWorkingDuration: string,
    normalBreakDuration: string,
    breakProjectId: Nullable<string>,
  }
  version: number
}

export const useSettingsStore = defineStore('settings', () => {
  const storage = useLocalStorage<SettingsStorageSerialized>('time-companion-settings-store', {
    values: {
      locale: 'en-US',
      theme: 'auto',
      normalWorkingDuration: 'PT8H',
      normalBreakDuration: 'PT30M',
      breakProjectId: null,
    },
    version: 0,
  })

  function commit(values: SettingsStorageSerialized['values']) {
    storage.set({
      version: 1,
      values,
    })
  }

  function getValue
    <
      TKey extends keyof SettingsStorageSerialized['values'],
      TValue extends unknown = SettingsStorageSerialized['values'][TKey]
    >
    (
      key: TKey,
      options: {
        get: (value: SettingsStorageSerialized['values'][TKey]) => TValue,
        set: (value: TValue) => SettingsStorageSerialized['values'][TKey],
      } = {
        get: (value) => value as unknown as TValue,
        set: (value) => value as unknown as SettingsStorageSerialized['values'][TKey],
      }
    ): Ref<TValue>
  {
    const {get: getTransformer, set: setTransformer} = options
    return customRef<TValue>((track, trigger) => {
      return {
        get() {
          track()
          return getTransformer(storage.get().values[key])
        },
        set(value: TValue) {
          commit({
            ...storage.get().values,
            [key]: unref(setTransformer(value)),
          })
          trigger()
        },
      }
    })
  }

  return {
    getValue,
  }
})