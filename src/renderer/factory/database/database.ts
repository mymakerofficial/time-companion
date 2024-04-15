import type { Database } from '@shared/database/database'
import { createIndexedDbFacade } from '@renderer/database/indexedDb/indexedDb'

export const database: Database = (() => {
  return createIndexedDbFacade()
})()
