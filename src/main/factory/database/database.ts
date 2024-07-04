import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '@shared/drizzle/schema'
import { todo } from '@shared/lib/utils/todo'
import Database from 'better-sqlite3'

todo()
export const database = drizzle(new Database('sqlite.db'), { schema })
