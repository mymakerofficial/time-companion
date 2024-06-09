import { defineMigration } from '@/shared/database/schema/defineMigration'
import { c } from '@shared/database/schema/columnBuilder'

export default defineMigration(async (transaction) => {
  await transaction.createTable('test', {
    id: c.uuid().primaryKey(),
    datetime: c.datetime(),
    datetimeIndexed: c.datetime().indexed(),
    date: c.date(),
    dateIndexed: c.date().indexed(),
    time: c.time(),
    timeIndexed: c.time().indexed(),
    interval: c.interval(),
    intervalIndexed: c.interval().indexed(),
  })
})
