import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core/db'
import type { DrizzleConfig } from 'drizzle-orm/utils'
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core/dialect'
import { SqliteWasmSession } from '@shared/drizzle/sqlite-wasm/session'
import {
  createTableRelationsHelpers,
  extractTablesRelationalConfig,
  type RelationalSchemaConfig,
  type TablesRelationalConfig,
} from 'drizzle-orm/relations'
import { SqliteWasmConnector } from '@shared/drizzle/connector/sqlite-wasm'

// maybe we need to change this in the future
export type SQLiteWasmRunResult = undefined

export interface SqliteWasmDatabase<
  TSchema extends Record<string, unknown> = Record<string, never>,
> extends BaseSQLiteDatabase<'sync', SQLiteWasmRunResult, TSchema> {}

export function drizzle<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(
  connector: SqliteWasmConnector,
  config: DrizzleConfig<TSchema> = {},
): SqliteWasmDatabase<TSchema> {
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

  const session = new SqliteWasmSession(connector, dialect, schema)
  return new BaseSQLiteDatabase(
    'sync',
    dialect,
    session,
    schema,
  ) as SqliteWasmDatabase<TSchema>
}
