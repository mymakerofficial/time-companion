import type { Database } from '@shared/database/database'
import { createFileSystemDBAdapter } from '@shared/database/adapters/fileSystem/database'
import { app } from 'electron'
import path from 'path'

export const database: Database = (() => {
  return createFileSystemDBAdapter(
    path.join(app.getPath('userData'), 'userdata'),
  )
})()
