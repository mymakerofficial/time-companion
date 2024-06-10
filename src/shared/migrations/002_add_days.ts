import { defineMigration } from '@shared/database/schema/defineMigration'
import { c } from '@shared/database/schema/columnBuilder'

export default defineMigration(async (transaction) => {
  await transaction.createTable('days', {
    id: c.uuid().primaryKey(),
    date: c.date().indexed().unique(),
    targetWorkDuration: c.interval().nullable(),
    createdAt: c.datetime(),
    modifiedAt: c.datetime().nullable(),
    deletedAt: c.datetime().nullable(),
  })
})
