import type { Database } from '@shared/database/types/database'
import { createDatabase } from '@shared/database/factory/database'
import { inMemoryDBAdapter } from '@shared/database/adapters/inMemory/database'

export const database: Database = (() => {
  return createDatabase(inMemoryDBAdapter())
  // return fileSystemDBAdapter(path.join(app.getPath('userData'), 'userdata'))
})()
