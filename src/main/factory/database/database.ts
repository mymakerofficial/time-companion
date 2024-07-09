import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '@shared/drizzle/schema'
import { todo } from '@shared/lib/utils/todo'
import Database from 'better-sqlite3'
import { fixTransactions } from '@shared/drizzle/lib/transaction'

todo()
export const database = fixTransactions(
  drizzle(new Database('sqlite.db'), { schema }),
)
