import {defineMigrator} from "@/lib/migrations";
import {useLocalStorage} from "@/composables/useLocalStorage";

const migrations = [
  // 0 -> 1
  () => {
    const localeStorage = useLocalStorage(
      'time-companion-settings-locale-store',
      { locale: 'en-US' })
    const themeStorage = useLocalStorage(
      'time-companion-settings-theme-store',
      'auto'
    )

    const { locale } = localeStorage.get()
    const theme = themeStorage.get()

    useLocalStorage('time-companion-settings-store', {
      version: 1,
      values: {
        locale,
        theme,
        normalWorkingDuration: 'PT8H',
        normalBreakDuration: 'PT0M',
        breakProjectId: null,
      },
    }).set()

    localeStorage.clear()
    themeStorage.clear()
  },
]

const applicationMigrator = defineMigrator(migrations)

export function migrateApplication() {
  const currentVersionStorage = useLocalStorage('time-companion-application-migration-version', 0)
  const currentVersion = currentVersionStorage.get()
  const targetVersion = migrations.length

  applicationMigrator({}, currentVersion)

  currentVersionStorage.set(targetVersion)
}