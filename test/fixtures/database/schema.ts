import { defineTable } from '@shared/database/schema/defineTable'
import type { Person, Pet } from '@test/fixtures/database/types'
import { t } from '@shared/database/schema/columnBuilder'

export const personsTable = defineTable<Person>('persons', {
  id: t.uuid().primaryKey(),
  firstName: t.string().indexed(),
  lastName: t.string(),
  username: t.string().indexed().unique(),
  gender: t.string(),
  age: t.number().indexed(),
})

export const petsTable = defineTable<Pet>('pets', {
  id: t.uuid().primaryKey(),
  name: t.string().indexed(),
  age: t.number(),
  ownerId: t.uuid(),
})
