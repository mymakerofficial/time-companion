import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core/db'
import type { DrizzleConfig } from 'drizzle-orm/utils'
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core/dialect'
import { SQLiteWasmSession } from '@shared/drizzle/lib/sqlite-wasm/session'
import {
  createTableRelationsHelpers,
  extractTablesRelationalConfig,
  type ExtractTablesWithRelations,
  type RelationalSchemaConfig,
  type TablesRelationalConfig,
} from 'drizzle-orm/relations'
import type { SQLiteWasmClient } from '@shared/drizzle/lib/sqlite-wasm/client'

// maybe we need to change this in the future
export type SQLiteWasmRunResult = undefined

export class SQLiteWasmDatabase<
  TFullSchema extends Record<string, unknown> = Record<string, never>,
  TSchema extends
    TablesRelationalConfig = ExtractTablesWithRelations<TFullSchema>,
> extends BaseSQLiteDatabase<
  'sync',
  SQLiteWasmRunResult,
  TFullSchema,
  TSchema
> {
  constructor(
    private client: SQLiteWasmClient,
    ...args: ConstructorParameters<
      typeof BaseSQLiteDatabase<
        'sync',
        SQLiteWasmRunResult,
        TFullSchema,
        TSchema
      >
    >
  ) {
    super(...args)
  }

  async init() {
    await this.client.init()
  }
}

export function drizzle<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(
  client: SQLiteWasmClient,
  config: DrizzleConfig<TSchema> = {},
): SQLiteWasmDatabase<TSchema> {
  const dialect = new SQLiteSyncDialect()

  let schema: RelationalSchemaConfig<TablesRelationalConfig> | undefined
  if (config.schema) {
    const tablesConfig = extractTablesRelationalConfig(
      config.schema,
      createTableRelationsHelpers,
    )
    schema = {
      fullSchema: config.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap,
    }
  }

  const session = new SQLiteWasmSession<TSchema, TablesRelationalConfig>(
    client,
    dialect,
    schema,
  )
  return new SQLiteWasmDatabase<TSchema, TablesRelationalConfig>(
    client,
    'sync',
    dialect,
    session,
    schema,
  ) as SQLiteWasmDatabase<TSchema>
}
