import { createService } from '@renderer/composables/createService'
import { useSettingsStore } from '@renderer/stores/settingsStore'
import { computed, reactive } from 'vue'
import {
  type BasicColorSchema,
  useColorMode,
  watchImmediate,
} from '@vueuse/core'
import { check } from '@renderer/lib/utils'
import { useElectronService } from '@renderer/services/electronService'

const additionalThemes = ['barf']

type Theme = BasicColorSchema | (typeof additionalThemes)[number]

export interface ThemeService {
  theme: Theme
  readonly isAuto: boolean
  availableThemes: ReadonlyArray<Theme>
}

export const useThemeService = createService<ThemeService>(() => {
  const store = useSettingsStore()
  const electronService = useElectronService()

  const colorMode = useColorMode({
    attribute: 'data-app-theme',
    storageKey: null,
    modes: additionalThemes.reduce(
      (acc, theme) => {
        acc[theme] = theme
        return acc
      },
      {} as Record<string, string>,
    ),
  })

  const availableThemes = computed(
    () => ['auto', 'dark', 'light', ...additionalThemes] as Theme[],
  )

  const theme = store.getValue<'theme', Theme>('theme', {
    get(value) {
      return value
    },
    set(value) {
      check(
        availableThemes.value.includes(value),
        `Theme ${value} is not available`,
      )

      return value
    },
  })

  const isAuto = computed({
    get() {
      return theme.value === 'auto'
    },
    set(value: boolean) {
      theme.value = value ? 'auto' : colorMode.value
    },
  })

  watchImmediate(theme, (value) => {
    colorMode.value = value

    electronService.setTitleBarColors({
      backgroundColor:
        colorMode.value === 'dark' ? 'hsl(0, 0%, 4%)' : 'hsl(0, 0%, 98%)',
      symbolColor:
        colorMode.value === 'dark' ? 'hsl(0, 0%, 98%)' : 'hsl(0, 0%, 9%)',
    })
  })

  return reactive({
    theme,
    isAuto,
    availableThemes,
  })
})
