import {defineStore} from "pinia";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {computed, reactive, watch} from "vue";
import {formatDurationIso, parseDuration} from "@/lib/neoTime";
import {Temporal} from "temporal-polyfill";

interface SettingsStorageSerialized {
  values: {
    [key: string]: any
  }
  version: number
}

export const useSettingsStore = defineStore('settings', () => {
  const storage = useLocalStorage<SettingsStorageSerialized>('time-companion-settings-store', {
    values: {
      locale: 'en-US',
      theme: 'auto',
      workingHours: 'PT8H',
    },
    version: 0,
  })

  const values = reactive(storage.get().values)
  watch(
    values,
    (values) => storage.set({
      version: 1,
      values,
    }),
    { deep: true}
  )

  const locale = computed({
    get: () => values.locale,
    set: (value: string) => values.locale = value,
  })

  const theme = computed({
    get: () => values.theme,
    set: (value: string) => values.theme = value,
  })

  const workingHours = computed({
    get: () => parseDuration(values.workingHours),
    set: (value: Temporal.Duration) => values.workingHours = formatDurationIso(value),
  })

  return {
    locale,
    theme,
    workingHours,
  }
})