import {createService} from "@/composables/createService";
import {useSettingsStore} from "@/stores/settingsStore";
import {computed, reactive} from "vue";
import {useI18n} from "vue-i18n";
import {syncRefs} from "@vueuse/core";
import {check} from "@/lib/utils";

export interface LocaleService {
  locale: string
  availableLocales: ReadonlyArray<string>
}

export const useLocaleService = createService<LocaleService>(() => {
  const store = useSettingsStore()
  const i18n = useI18n()

  const availableLocales = computed(() => i18n.availableLocales)

  const locale = store.getValue('locale', {
    get(value) {
      return value
    },
    set(value) {
      check(availableLocales.value.includes(value),
        `Locale ${value} is not available`
      )

      return value
    }
  })

  syncRefs(locale, i18n.locale, { immediate: true })

  return reactive({
    locale,
    availableLocales,
  })
})