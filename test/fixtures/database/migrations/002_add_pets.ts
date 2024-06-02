import { defineMigration } from '@/shared/database/schema/defineMigration'
import { c } from '@shared/database/schema/columnBuilder'

export default defineMigration(async (transaction) => {
  await transaction.createTable('pets', {
    id: c.uuid().primaryKey(),
    name: c.string().indexed(),
    age: c.number(),
    ownerId: c.uuid(),
  })
})
