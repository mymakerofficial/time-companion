import type { Database } from '@shared/drizzle/database'
import { handleSqliteError } from '@shared/drizzle/lib/error'
import { settingsTable } from '@shared/model/settings'
import { eq } from 'drizzle-orm'
import { firstOf } from '@shared/lib/utils/list'
import { check, isNotEmpty } from '@shared/lib/utils/checks'
import type { Nullable } from '@shared/lib/utils/types'

export type SettingsPersistenceDependencies = {
  database: Database
}

export function createSettingsPersistence(
  deps: SettingsPersistenceDependencies,
): SettingsPersistence {
  return new SettingsPersistence(deps.database)
}

export class SettingsPersistence {
  constructor(private readonly database: Database) {}

  async getValue(key: string): Promise<Nullable<string>> {
    const rows = await this.database
      .select({
        value: settingsTable.value,
      })
      .from(settingsTable)
      .where(eq(settingsTable.key, key))
      .limit(1)
      .catch(handleSqliteError)

    check(isNotEmpty(rows), `key not found: ${key}`)

    return firstOf(rows).value
  }

  async setValue(key: string, value: Nullable<string>): Promise<void> {
    await this.database
      .update(settingsTable)
      .set({ value })
      .where(eq(settingsTable.key, key))
      .catch(handleSqliteError)
  }
}
