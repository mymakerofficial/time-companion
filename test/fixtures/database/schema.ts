import { defineTable } from '@shared/database/schema/defineTable'
import type { Person, Pet } from '@test/fixtures/database/types'
import { c } from '@shared/database/schema/columnBuilder'

export const personsTable = defineTable<Person>('persons', {
  id: c.uuid().primaryKey(),
  firstName: c.string().indexed(),
  lastName: c.string(),
  username: c.string().indexed().unique(),
  gender: c.string(),
  age: c.number().indexed(),
})

export const petsTable = defineTable<Pet>('pets', {
  id: c.uuid().primaryKey(),
  name: c.string().indexed(),
  age: c.number(),
  ownerId: c.uuid(),
})
