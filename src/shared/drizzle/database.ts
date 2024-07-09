import * as schema from '@shared/drizzle/schema'
import type { ExtractTablesWithRelations } from 'drizzle-orm/relations'
import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core/db'

/***
 * The drizzle database type.
 */
export type Database = BaseSQLiteDatabase<
  'sync',
  unknown,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>
