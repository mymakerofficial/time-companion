import * as schema from '@shared/drizzle/schema'
import { drizzle } from '@shared/drizzle/sqlite-wasm/driver'
import { sqliteWasm } from '@shared/drizzle/sqlite-wasm/client'
import { fixTransactions } from '@shared/drizzle/transaction'

export const database = fixTransactions(
  drizzle(sqliteWasm(), {
    schema,
  }),
)
