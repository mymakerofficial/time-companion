import type { Database } from '@shared/database/types/database'
import { indexedDBAdapter } from '@shared/database/adapters/indexedDB/database'
import { createDatabase } from '@shared/database/factory/database'

export const database: Database = (() => {
  return createDatabase(indexedDBAdapter())
})()
