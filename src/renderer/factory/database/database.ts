import * as schema from '@shared/drizzle/schema'
import { drizzle } from '@shared/drizzle/sqlite-wasm/driver'
import { sqliteWasm } from '@shared/drizzle/sqlite-wasm/client'

export const database = drizzle(sqliteWasm(), {
  schema,
})
