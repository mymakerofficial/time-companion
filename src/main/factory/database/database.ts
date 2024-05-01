import type { Database } from '@shared/database/types/database'
import { fileSystemDBAdapter } from '@shared/database/adapters/fileSystem/database'
import { app } from 'electron'
import path from 'path'

export const database: Database = (() => {
  return fileSystemDBAdapter(path.join(app.getPath('userData'), 'userdata'))
})()
