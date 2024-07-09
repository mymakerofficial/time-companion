import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core/db'
import type { SQLiteWasmDatabase } from '@shared/drizzle/lib/sqlite-wasm/driver'
import { isFunction } from '@shared/lib/utils/checks'
import { sql } from 'drizzle-orm'

/***
 * Initializes the database.
 *  This function must be run before any other database operations.
 */
export async function initialize<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(database: BaseSQLiteDatabase<'sync', unknown, TSchema>) {
  if (isSQLiteWasmDatabase(database)) {
    // sqlite-wasm requires explicit initialization
    //  this has to be async
    await database.init()
  }

  // enable write-ahead logging
  database.run(sql`PRAGMA journal_mode = WAL`)

  // enable foreign key constraints
  database.run(sql`PRAGMA foreign_keys = ON`)
}

function isSQLiteWasmDatabase<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(
  database: BaseSQLiteDatabase<'sync', unknown, TSchema>,
): database is SQLiteWasmDatabase<TSchema> {
  return isFunction((database as SQLiteWasmDatabase<TSchema>).init)
}
