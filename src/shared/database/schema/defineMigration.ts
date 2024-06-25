import type { MigrationFunction } from '@database/types/database'

export function defineMigration(migrationFn: MigrationFunction) {
  return migrationFn
}
