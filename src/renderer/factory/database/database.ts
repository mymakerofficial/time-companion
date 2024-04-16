import type { Database } from '@shared/database/database'
import { createIndexedDbAdapter } from '@shared/database/adapters/indexedDb/indexedDb'

export const database: Database = (() => {
  return createIndexedDbAdapter()
})()
