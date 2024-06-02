import type { MigrationFunction } from '@shared/database/types/database'

export function defineMigration(migrationFn: MigrationFunction) {
  return migrationFn
}
