import { defineMigration } from '@/shared/database/schema/defineMigration'
import { t } from '@shared/database/schema/columnBuilder'

export default defineMigration(async (transaction) => {
  await transaction.createTable('pets', {
    id: t.uuid().primaryKey(),
    name: t.string().indexed(),
    age: t.number(),
    ownerId: t.uuid(),
  })
})
