import type { Database } from '@shared/database/database'
import { createIndexedDbFacade } from '@shared/database/adapters/indexedDb/indexedDb'

export const database: Database = (() => {
  return createIndexedDbFacade()
})()
