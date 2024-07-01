import { drizzle } from 'drizzle-orm/better-sqlite3'
import { BetterSqlite3Connector } from '@shared/drizzle/connector/better-sqlite3'
import * as schema from '@shared/drizzle/schema'
import { todo } from '@shared/lib/utils/todo'

todo()
export const connector = new BetterSqlite3Connector('sqlite.db')
export const database = drizzle(connector.database, { schema })
