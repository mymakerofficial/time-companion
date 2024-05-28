import { defineMigration } from '@shared/database/schema/defineMigration'
import { t } from '@shared/database/schema/columnBuilder'

export default defineMigration(async (transaction) => {
  await transaction.createTable('projects', {
    id: t.uuid().primaryKey(),
    displayName: t.string().indexed(),
    color: t.string().nullable(),
    isBillable: t.boolean(),
    createdAt: t.string(),
    modifiedAt: t.string().nullable(),
    deletedAt: t.string().nullable(),
  })

  await transaction.createTable('tasks', {
    id: t.uuid().primaryKey(),
    projectId: t.uuid(),
    displayName: t.string().indexed(),
    color: t.string().nullable(),
    createdAt: t.string(),
    modifiedAt: t.string().nullable(),
    deletedAt: t.string().nullable(),
  })
})
