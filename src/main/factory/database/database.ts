import { createDatabase } from '@database/factory/database'
import config from '@shared/database.config'
import { pgliteAdapter } from '@database/adapters/pglite/database'
import path from 'path'
import { app } from 'electron'

export const database = (() => {
  const dataDir = path.join(app.getPath('userData'), 'db')
  return createDatabase(pgliteAdapter(dataDir), config)
})()
