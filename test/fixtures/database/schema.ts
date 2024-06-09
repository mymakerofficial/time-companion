import { defineTable } from '@shared/database/schema/defineTable'
import type { Person, Pet } from '@test/fixtures/database/types'
import { c } from '@shared/database/schema/columnBuilder'

export const personsTable = defineTable<Person>('persons', {
  id: c.uuid().primaryKey(),
  firstName: c.text().indexed(),
  lastName: c.text(),
  username: c.text().indexed().unique(),
  gender: c.text(),
  age: c.number().indexed(),
})

export const petsTable = defineTable<Pet>('pets', {
  id: c.uuid().primaryKey(),
  name: c.text().indexed(),
  age: c.number(),
  ownerId: c.uuid(),
})
