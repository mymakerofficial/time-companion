import type { Database } from '@shared/database/database'
import { createIndexedDBAdapter } from '@shared/database/adapters/indexedDB/indexedDB'

export const database: Database = (() => {
  return createIndexedDBAdapter()
})()
