import type { Database } from '@shared/database/database'
import { createFileSystemDBAdapter } from '@shared/database/adapters/fileSystem/database'

export const database: Database = (() => {
  return createFileSystemDBAdapter()
})()
