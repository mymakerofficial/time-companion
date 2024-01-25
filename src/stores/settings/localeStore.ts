import {defineStore} from "pinia";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {computed, reactive, watch} from "vue";
import {useI18n} from "vue-i18n";
import {syncRefs} from "@vueuse/core";

interface LocaleStorageSerialized {
  locale: string
}

const defaultState: LocaleStorageSerialized = {
  locale: 'en-US',
}

export const useLocaleStore = defineStore('settings-locale', () => {
  const i18n = useI18n()
  const storage = useLocalStorage<LocaleStorageSerialized>('time-companion-settings-locale-store', defaultState)

  // state

  const state = reactive({
    ...defaultState,
    ...storage.get(),
  })
  watch(() => state, storage.set, { deep: true})

  // availableLocales

  const availableLocales = computed(() => i18n.availableLocales)

  // locale

  syncRefs(() => state.locale, i18n.locale)

  const locale = computed({
    get: () => state.locale,
    set: (value: string) => {
      if (!availableLocales.value.includes(value)) {
        throw new Error(`Locale ${value} is not available`)
      }

      state.locale = value
    }
  })

  return {
    availableLocales,
    locale,
  }
})