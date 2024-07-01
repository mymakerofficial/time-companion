import type {
  RelationalSchemaConfig,
  TablesRelationalConfig,
} from 'drizzle-orm/relations'
import {
  type PreparedQueryConfig,
  type SQLiteExecuteMethod,
  SQLitePreparedQuery,
  SQLiteSession,
  SQLiteTransaction,
  type SQLiteTransactionConfig,
} from 'drizzle-orm/sqlite-core/session'
import type { SQLiteWasmRunResult } from '@shared/drizzle/sqlite-wasm/driver'
import type { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core/dialect'
import {
  type DriverValueDecoder,
  fillPlaceholders,
  type Query,
  SQL,
} from 'drizzle-orm/sql/sql'
import type { SelectedFieldsOrdered } from 'drizzle-orm/sqlite-core/query-builders/select.types'
import { entityKind, is } from 'drizzle-orm/entity'
import { sql } from 'drizzle-orm'
import type { Database as SqliteDatabase } from '@sqlite.org/sqlite-wasm'
import { SqliteWasmConnector } from '@shared/drizzle/connector/sqlite-wasm'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { Column } from 'drizzle-orm/column'
import { getTableName } from 'drizzle-orm/table'

export class SqliteWasmSession<
  TFullSchema extends Record<string, unknown>,
  TSchema extends TablesRelationalConfig,
> extends SQLiteSession<'sync', SQLiteWasmRunResult, TFullSchema, TSchema> {
  static readonly [entityKind]: string = 'SQLiteWasmSession'

  constructor(
    private connector: SqliteWasmConnector,
    dialect: SQLiteSyncDialect,
    private schema: RelationalSchemaConfig<TSchema> | undefined,
  ) {
    super(dialect)
  }

  override prepareQuery<T extends PreparedQueryConfig>(
    query: Query,
    fields: SelectedFieldsOrdered | undefined,
    executeMethod: SQLiteExecuteMethod,
    isResponseInArrayMode: boolean,
    customResultMapper?: (rows: unknown[][]) => unknown,
  ): SQLiteWasmPreparedQuery<T> {
    check(isNotNull(this.connector.database), 'Database not initialized')
    return new SQLiteWasmPreparedQuery<T>(
      this.connector.database,
      query,
      fields,
      executeMethod,
      isResponseInArrayMode,
      customResultMapper,
    )
  }

  override transaction<T>(
    transaction: (
      tx: SQLiteTransaction<'sync', SQLiteWasmRunResult, TFullSchema, TSchema>,
    ) => T,
    config: SQLiteTransactionConfig = {},
  ): T {
    const tx = new SQLiteWasmTransaction(
      'sync',
      // @ts-expect-error
      this.dialect,
      this,
      this.schema,
    )
    this.run(sql.raw(`begin${config?.behavior ? ' ' + config.behavior : ''}`))
    try {
      const result = transaction(tx)
      this.run(sql`commit`)
      return result
    } catch (err) {
      this.run(sql`rollback`)
      throw err
    }
  }
}

export class SQLiteWasmPreparedQuery<
  T extends PreparedQueryConfig = PreparedQueryConfig,
> extends SQLitePreparedQuery<{
  type: 'sync'
  run: SQLiteWasmRunResult
  all: T['all']
  get: T['get']
  values: T['values']
  execute: T['execute']
}> {
  constructor(
    private database: SqliteDatabase,
    query: Query,
    private fields: SelectedFieldsOrdered | undefined,
    executeMethod: SQLiteExecuteMethod,
    private isResponseInArrayMode: boolean,
    private customResultMapper?: (rows: unknown[][]) => unknown,
  ) {
    super('sync', executeMethod, query)
  }

  run(
    placeholderValues: Record<string, unknown> | undefined,
  ): SQLiteWasmRunResult {
    const params = fillPlaceholders(
      this.query.params,
      placeholderValues ?? {},
    ) as string[]
    this.database.exec({
      sql: this.query.sql,
      bind: params,
    })
  }

  all(placeholderValues: Record<string, unknown> | undefined): T['all'] {
    const rows = this.values(placeholderValues) as unknown[][]

    if (!this.fields && !this.customResultMapper) {
      return rows
    }

    if (this.customResultMapper) {
      return this.customResultMapper(rows) as T['all']
    }

    // @ts-expect-error
    const { joinsNotNullableMap } = this
    return rows.map((row) =>
      mapResultRow(this.fields!, row, joinsNotNullableMap),
    )
  }

  get(placeholderValues: Record<string, unknown> | undefined): T['get'] {
    const params = fillPlaceholders(
      this.query.params,
      placeholderValues ?? {},
    ) as string[]

    const stmt = this.database.prepare(this.query.sql).bind(params)
    stmt.step()
    const row = stmt.get([])

    if (!row) {
      return undefined
    }

    if (!this.fields && !this.customResultMapper) {
      return row
    }

    if (this.customResultMapper) {
      return this.customResultMapper([row]) as T['get']
    }

    // @ts-expect-error
    const { joinsNotNullableMap } = this
    return mapResultRow(this.fields!, row, joinsNotNullableMap)
  }

  values(placeholderValues: Record<string, unknown> | undefined): T['values'] {
    const params = fillPlaceholders(
      this.query.params,
      placeholderValues ?? {},
    ) as string[]
    return this.database.exec({
      sql: this.query.sql,
      bind: params,
      returnValue: 'resultRows',
    })
  }
}

export class SQLiteWasmTransaction<
  TFullSchema extends Record<string, unknown>,
  TSchema extends TablesRelationalConfig,
> extends SQLiteTransaction<
  'sync',
  SQLiteWasmRunResult,
  TFullSchema,
  TSchema
> {}

/***
 * drizzle internal function
 * @source: https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/utils.ts
 */
export function mapResultRow<TResult>(
  columns: SelectedFieldsOrdered,
  row: unknown[],
  joinsNotNullableMap: Record<string, boolean> | undefined,
): TResult {
  // Key -> nested object key, value -> table name if all fields in the nested object are from the same table, false otherwise
  const nullifyMap: Record<string, string | false> = {}

  const result = columns.reduce<Record<string, any>>(
    (result, { path, field }, columnIndex) => {
      let decoder: DriverValueDecoder<unknown, unknown>
      if (is(field, Column)) {
        decoder = field
      } else if (is(field, SQL)) {
        // @ts-expect-error
        decoder = field.decoder
      } else {
        // @ts-expect-error
        decoder = field.sql.decoder
      }
      let node = result
      for (const [pathChunkIndex, pathChunk] of path.entries()) {
        if (pathChunkIndex < path.length - 1) {
          if (!(pathChunk in node)) {
            node[pathChunk] = {}
          }
          node = node[pathChunk]
        } else {
          const rawValue = row[columnIndex]!
          const value = (node[pathChunk] =
            rawValue === null ? null : decoder.mapFromDriverValue(rawValue))

          if (joinsNotNullableMap && is(field, Column) && path.length === 2) {
            const objectName = path[0]!
            if (!(objectName in nullifyMap)) {
              nullifyMap[objectName] =
                value === null ? getTableName(field.table) : false
            } else if (
              typeof nullifyMap[objectName] === 'string' &&
              nullifyMap[objectName] !== getTableName(field.table)
            ) {
              nullifyMap[objectName] = false
            }
          }
        }
      }
      return result
    },
    {},
  )

  // Nullify all nested objects from nullifyMap that are nullable
  if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
    for (const [objectName, tableName] of Object.entries(nullifyMap)) {
      if (typeof tableName === 'string' && !joinsNotNullableMap[tableName]) {
        result[objectName] = null
      }
    }
  }

  return result as TResult
}
