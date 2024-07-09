import * as schema from '@shared/drizzle/schema'
import { drizzle } from '@shared/drizzle/lib/sqlite-wasm/driver'
import { sqliteWasm } from '@shared/drizzle/lib/sqlite-wasm/client'
import { fixTransactions } from '@shared/drizzle/lib/transaction'

export const database = fixTransactions(
  drizzle(sqliteWasm(), {
    schema,
  }),
)
