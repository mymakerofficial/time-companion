import * as schema from '@shared/drizzle/schema'
import { SqliteWasmConnector } from '@shared/drizzle/connector/sqlite-wasm'
import { drizzle } from '@shared/drizzle/sqlite-wasm/driver'

export const connector = new SqliteWasmConnector()
export const database = drizzle(connector, {
  schema,
})
