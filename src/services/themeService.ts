import {createService} from "@/composables/createService";
import {useSettingsStore} from "@/stores/settingsStore";
import {computed, reactive} from "vue";
import {check} from "@/lib/utils";
import {syncRefs, useColorMode} from "@vueuse/core";

export interface ThemeService {
  theme: string
  isAuto: boolean
  availableThemes: ReadonlyArray<string>
}

export const useThemeService = createService<ThemeService>(() => {
  const store = useSettingsStore()
  const colorMode = useColorMode({
    attribute: 'data-theme',
    storageKey: null,
  })

  const availableThemes = computed<ThemeService['availableThemes']>(() => ['auto', 'dark', 'light'])

  const theme = computed<ThemeService['theme']>({
    get() {
      return store.theme
    },
    set(value) {
      check(availableThemes.value.includes(value),
        `Theme ${value} is not available`
      )

      store.theme = value
    }
  })

  const isAuto = computed({
    get() {
      return theme.value === 'auto'
    },
    set(value: boolean) {
      theme.value = value ? 'auto' : colorMode.value
    }
  })

  syncRefs(theme, colorMode, { immediate: true })

  return reactive({
    theme,
    isAuto,
    availableThemes,
  })
})