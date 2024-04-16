import { createInMemoryDatabase } from '@shared/database/adapters/inMemory/inMemoryDatabase'
import type { Database } from '@shared/database/database'

export const database: Database = (() => {
  return createInMemoryDatabase()
})()
