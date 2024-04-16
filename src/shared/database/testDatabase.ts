import type { Database } from '@shared/database/database'
import { createInMemoryDatabase } from '@shared/database/adapters/inMemory/inMemoryDatabase'

export function createTestDatabase(): Database {
  const database = createInMemoryDatabase()

  // TODO this is a hack to create the tables

  database.open('test', async (transaction) => {
    const projectsTable = await transaction.createTable({
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
      primaryKey: 'id',
    })

    await projectsTable.createIndex({
      keyPath: 'displayName',
      unique: true,
    })

    const tasksTable = await transaction.createTable({
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
      primaryKey: 'id',
    })

    await tasksTable.createIndex({
      keyPath: 'displayName',
      unique: true,
    })
  })

  return database
}
