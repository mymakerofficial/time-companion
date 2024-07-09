import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core/db'
import { sql } from 'drizzle-orm'

/***
 * Runs the given function in a transaction.
 */
export async function transacting<
  T,
  TSchema extends Record<string, unknown> = Record<string, never>,
>(
  database: BaseSQLiteDatabase<'sync', unknown, TSchema>,
  fn: (database: BaseSQLiteDatabase<'sync', unknown, TSchema>) => Promise<T>,
): Promise<T> {
  await database.run(sql`BEGIN`)
  try {
    const result = await fn(database)
    await database.run(sql`COMMIT`)
    return result
  } catch (err) {
    await database.run(sql`ROLLBACK`)
    throw err
  }
}

/***
 * The current version of drizzle doesn't work with async transactions.
 *  This function wraps the database object in a proxy and implements a
 *  custom transaction function that works with async functions.
 *
 * **Note:** nested transactions are not supported and will fail.
 */
export function fixTransactions<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(
  database: BaseSQLiteDatabase<'sync', unknown, TSchema>,
): BaseSQLiteDatabase<'sync', unknown, TSchema> {
  return new Proxy(database, {
    get(target, prop, receiver) {
      if (prop === 'transaction') {
        return <T>(
          fn: (tx: BaseSQLiteDatabase<'sync', unknown, TSchema>) => Promise<T>,
        ) => transacting(database, fn)
      }
      return Reflect.get(target, prop, receiver)
    },
  })
}
