import * as schema from './schema'
import { drizzle, Sqlite3Connector } from '@shared/drizzle/sqlite-wasm'

const connector = new Sqlite3Connector()
export const db = drizzle(connector, {
  schema,
})
export type Database = typeof db
