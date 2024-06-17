import { defineMigration } from '@shared/database/schema/defineMigration'
import { c } from '@shared/database/schema/columnBuilder'

export default defineMigration(async (transaction) => {
  await transaction.createTable('days', {
    id: c.uuid().primaryKey(),
    date: c.date().indexed().unique(),
    targetBillableDuration: c.interval().nullable(),
    createdAt: c.datetime(),
    modifiedAt: c.datetime().nullable(),
    deletedAt: c.datetime().nullable(),
  })

  await transaction.createTable('time_entries', {
    id: c.uuid().primaryKey(),
    dayId: c.uuid().indexed(),
    projectId: c.uuid().nullable().indexed(),
    taskId: c.uuid().nullable(),
    description: c.text(),
    startedAt: c.datetime().indexed(),
    stoppedAt: c.datetime().nullable().indexed(),
    createdAt: c.datetime(),
    modifiedAt: c.datetime().nullable(),
    deletedAt: c.datetime().nullable(),
  })
})
