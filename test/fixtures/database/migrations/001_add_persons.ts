import { defineMigration } from '@shared/database/schema/defineMigration'
import { c } from '@shared/database/schema/columnBuilder'

export default defineMigration(async (transaction) => {
  await transaction.createTable('persons', {
    id: c.uuid().primaryKey(),
    firstName: c.string().indexed(),
    lastName: c.string(),
    username: c.string().indexed().unique(),
    gender: c.string(),
    age: c.number().indexed(),
  })
})
