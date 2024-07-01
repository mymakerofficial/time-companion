import * as schema from './schema'
import type { SQLiteTransaction } from 'drizzle-orm/sqlite-core/session'
import type { ExtractTablesWithRelations } from 'drizzle-orm/relations'
import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core/db'

export type Database = BaseSQLiteDatabase<
  'sync',
  unknown,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>
export type Transaction = SQLiteTransaction<
  'sync',
  unknown,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>
