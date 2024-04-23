import type { Database } from '@shared/database/database'
import { createIndexedDBAdapter } from '@shared/database/adapters/indexedDB/database'

export const database: Database = (() => {
  return createIndexedDBAdapter()
})()
