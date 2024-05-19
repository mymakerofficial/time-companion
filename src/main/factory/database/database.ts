import { createDatabase } from '@shared/database/factory/database'
import config from '@shared/database.config'
import { pgliteAdapter } from '@shared/database/adapters/pglite/database'
import path from 'path'
import { app } from 'electron'

export const database = (() => {
  const dataDir = path.join(app.getPath('userData'), 'db')
  return createDatabase(pgliteAdapter(dataDir), config)
})()
