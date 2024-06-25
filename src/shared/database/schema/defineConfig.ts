import type { DatabaseConfig } from '@database/types/database'
import type { DatabaseSchema } from '@database/types/schema'

export function defineConfig<TSchema extends DatabaseSchema>(
  config: DatabaseConfig<TSchema>,
): DatabaseConfig<TSchema> {
  return config
}
