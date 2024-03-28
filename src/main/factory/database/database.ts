import { createSingleton } from '@shared/lib/helpers/createSingleton'
import { createInMemoryDatabase } from '@shared/database/inMemory/database'
import type { Database } from '@shared/database/database'

export const database = createSingleton((): Database => {
  return createInMemoryDatabase()
})()
