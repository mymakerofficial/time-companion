import { createDatabase } from '@database/factory/database'
import config from '@shared/database.config'
import { SqliteWasmDatabaseAdapter } from '@database/adapters/sqlite-wasm/database'

export const database = (() => {
  return createDatabase(new SqliteWasmDatabaseAdapter(), config)
})()
