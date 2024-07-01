import * as schema from './schema'
import { drizzle, Sqlite3Connector } from '@shared/drizzle/sqlite-wasm'
import type { SQLiteTransaction } from 'drizzle-orm/sqlite-core/session'
import type { SqliteRemoteResult } from 'drizzle-orm/sqlite-proxy/driver'
import type { ExtractTablesWithRelations } from 'drizzle-orm/relations'
import { sql } from 'drizzle-orm'

const connector = new Sqlite3Connector()
export const db = drizzle(connector, {
  schema,
})
export type Database = typeof db
export type Transaction = SQLiteTransaction<
  'async',
  SqliteRemoteResult<unknown>,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>

db.get(sql.raw('PRAGMA foreign_keys = ON'))
