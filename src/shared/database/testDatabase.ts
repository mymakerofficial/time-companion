import type { Database } from '@shared/database/database'
import { createSingleton } from '@shared/lib/helpers/createSingleton'
import { createInMemoryDatabase } from '@shared/database/inMemory/database'

export const testDatabase = createSingleton((): Database => {
  const database = createInMemoryDatabase()

  // TODO this is a hack to create the tables

  database.createTable({
    name: 'projects',
    schema: {
      id: 'string',
      displayName: 'string',
      color: 'string',
      isBillable: 'boolean',
      createdAt: 'string',
      modifiedAt: 'string',
      deletedAt: 'string',
    },
  })

  database.createTable({
    name: 'tasks',
    schema: {
      id: 'string',
      projectId: 'string',
      displayName: 'string',
      color: 'string',
      createdAt: 'string',
      modifiedAt: 'string',
      deletedAt: 'string',
    },
  })

  return database
})
