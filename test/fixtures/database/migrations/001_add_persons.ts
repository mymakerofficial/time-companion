import { defineMigration } from '@database/schema/defineMigration'
import { c } from '@database/schema/columnBuilder'

export default defineMigration(async (transaction) => {
  await transaction.createTable('persons', {
    id: c.uuid().primaryKey(),
    firstName: c.text().indexed(),
    lastName: c.text(),
    username: c.text().indexed().unique(),
    gender: c.text(),
    age: c.number().indexed(),
  })
})
