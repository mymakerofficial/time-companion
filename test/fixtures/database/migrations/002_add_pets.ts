import { defineMigration } from '@/shared/database/schema/defineMigration'
import { c } from '@database/schema/columnBuilder'

export default defineMigration(async (transaction) => {
  await transaction.createTable('pets', {
    id: c.uuid().primaryKey(),
    name: c.text().indexed(),
    age: c.number(),
    ownerId: c.uuid(),
  })
})
