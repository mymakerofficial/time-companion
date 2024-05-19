import { indexedDBAdapter } from '@shared/database/adapters/indexedDB/database'
import { createDatabase } from '@shared/database/factory/database'
import config from '@shared/database.config'

export const database = (() => {
  return createDatabase(indexedDBAdapter('time-companion'), config)
})()
