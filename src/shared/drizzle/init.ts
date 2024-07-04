import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core/db'
import type { SQLiteWasmDatabase } from '@shared/drizzle/sqlite-wasm/driver'
import { isFunction } from '@shared/lib/utils/checks'

/***
 * Initializes the database if required.
 */
export async function initialize<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(database: BaseSQLiteDatabase<'sync', unknown, TSchema>) {
  if (isSQLiteWasmDatabase(database)) {
    await database.init()
  }
}

function isSQLiteWasmDatabase(
  database: any,
): database is SQLiteWasmDatabase<{}, {}> {
  return isFunction(database?.init)
}
