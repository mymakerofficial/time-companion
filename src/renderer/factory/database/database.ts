import { createDatabase } from '@database/factory/database'
import config from '@shared/database.config'
import { indexedDBAdapter } from '@database/adapters/indexedDB/database'

export const database = (() => {
  return createDatabase(indexedDBAdapter('time-companion'), config)
})()
