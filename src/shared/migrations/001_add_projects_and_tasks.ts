import { defineMigration } from '@shared/database/schema/defineMigration'
import { c } from '@shared/database/schema/columnBuilder'

export default defineMigration(async (transaction) => {
  await transaction.createTable('projects', {
    id: c.uuid().primaryKey(),
    displayName: c.string().indexed().unique(),
    color: c.string().nullable(),
    isBillable: c.boolean(),
    createdAt: c.string(),
    modifiedAt: c.string().nullable(),
    deletedAt: c.string().nullable(),
  })

  await transaction.createTable('tasks', {
    id: c.uuid().primaryKey(),
    projectId: c.uuid(),
    displayName: c.string().indexed(),
    color: c.string().nullable(),
    createdAt: c.string(),
    modifiedAt: c.string().nullable(),
    deletedAt: c.string().nullable(),
  })
})
