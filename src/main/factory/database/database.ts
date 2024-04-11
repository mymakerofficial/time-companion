import { createInMemoryDatabase } from '@shared/database/inMemory/database'
import type { Database } from '@shared/database/database'

export const database: Database = (() => {
  return createInMemoryDatabase()
})()
