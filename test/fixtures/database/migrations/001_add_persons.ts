import { defineMigration } from '@shared/database/schema/defineMigration'
import { t } from '@shared/database/schema/columnBuilder'

export default defineMigration(async (transaction) => {
  await transaction.createTable('persons', {
    id: t.uuid().primaryKey(),
    firstName: t.string().indexed(),
    lastName: t.string(),
    username: t.string().indexed().unique(),
    gender: t.string(),
    age: t.number().indexed(),
  })
})
