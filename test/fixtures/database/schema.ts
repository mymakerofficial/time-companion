import { defineTable } from '@shared/database/schema/defineTable'
import { c } from '@shared/database/schema/columnBuilder'
import type { InferTable } from '@shared/database/types/schema'

export const personsTable = defineTable('persons', {
  id: c.uuid().primaryKey(),
  firstName: c.text().indexed(),
  lastName: c.text(),
  username: c.text().indexed().unique(),
  gender: c.text(),
  age: c.number().indexed(),
})

export type Person = InferTable<typeof personsTable>

export const petsTable = defineTable('pets', {
  id: c.uuid().primaryKey(),
  name: c.text().indexed(),
  age: c.number(),
  ownerId: c.uuid(),
})

export type Pet = InferTable<typeof petsTable>

export const testTable = defineTable('test', {
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

export type TestRow = InferTable<typeof testTable>
