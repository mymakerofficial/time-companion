import type { DatabaseConfig } from '@shared/database/types/database'
import type { DatabaseSchema } from '@shared/database/types/schema'

export function defineConfig<TSchema extends DatabaseSchema>(
  config: DatabaseConfig<TSchema>,
): DatabaseConfig<TSchema> {
  return config
}
