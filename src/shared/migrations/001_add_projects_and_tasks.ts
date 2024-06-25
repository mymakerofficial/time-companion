import { defineMigration } from '@database/schema/defineMigration'
import { c } from '@database/schema/columnBuilder'

export default defineMigration(async (transaction) => {
  await transaction.createTable('projects', {
    id: c.uuid().primaryKey(),
    displayName: c.text().indexed().unique(),
    color: c.text().nullable(),
    isBillable: c.boolean(),
    isBreak: c.boolean(),
    createdAt: c.datetime(),
    modifiedAt: c.datetime().nullable(),
    deletedAt: c.datetime().nullable(),
  })

  await transaction.createTable('tasks', {
    id: c.uuid().primaryKey(),
    displayName: c.text().indexed(),
    color: c.text().nullable(),
    createdAt: c.datetime(),
    modifiedAt: c.datetime().nullable(),
    deletedAt: c.datetime().nullable(),
  })
})
