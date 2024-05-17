import { describe, expect, test } from 'vitest'
import { wherePredicate } from '@shared/database/helpers/wherePredicate'
import { defineTable } from '@shared/database/schema/defineTable'
import { number, string } from '@shared/database/schema/columnBuilder'
import { uuid } from '@shared/lib/utils/uuid'
import type { WhereBuilder } from '@shared/database/types/schema'

interface Person {
  id: string
  name: string
  favouriteColor: string
  favouriteSport: string
  age: number
}

const personsTable = defineTable<Person>('persons', {
  id: string().primaryKey(),
  name: string(),
  favouriteColor: string(),
  favouriteSport: string(),
  age: number(),
})

const whereComplicated = personsTable.name
  .contains('John')
  .and(personsTable.name.contains('Doe'))
  .and(
    personsTable.favouriteColor
      .equals('red')
      .or(personsTable.favouriteColor.equals('blue')),
  )
  .and(personsTable.age.gte(18).and(personsTable.age.lt(30)))
  .and(personsTable.favouriteSport.in(['bouldering', 'cycling']))

interface Case {
  name: string
  data: Person
  where: WhereBuilder<Person>
  expected: boolean
}

const cases: Array<Case> = [
  {
    name: 'returns true because all conditions are satisfied perfectly',
    data: {
      id: uuid(),
      name: 'John Doe',
      favouriteColor: 'red',
      favouriteSport: 'bouldering',
      age: 25,
    },
    where: whereComplicated,
    expected: true,
  },
  {
    name: 'returns true even if field with contains condition contains extra characters',
    data: {
      id: uuid(),
      name: 'John James Doe The third',
      favouriteColor: 'red',
      favouriteSport: 'cycling',
      age: 25,
    },
    where: whereComplicated,
    expected: true,
  },
  {
    name: 'returns false because field does not satisfy all contains conditions',
    data: {
      id: uuid(),
      name: 'John',
      favouriteColor: 'red',
      favouriteSport: 'bouldering',
      age: 25,
    },
    where: whereComplicated,
    expected: false,
  },
  {
    name: 'returns false because field with greater than or equal condition is less than expected',
    data: {
      id: uuid(),
      name: 'John Doe',
      favouriteColor: 'red',
      favouriteSport: 'bouldering',
      age: 16,
    },
    where: whereComplicated,
    expected: false,
  },
  {
    name: 'returns false because field with less than condition is greater than expected',
    data: {
      id: uuid(),
      name: 'John Doe',
      favouriteColor: 'red',
      favouriteSport: 'bouldering',
      age: 50,
    },
    where: whereComplicated,
    expected: false,
  },
  {
    name: 'returns false because field with in condition is not in the list',
    data: {
      id: uuid(),
      name: 'John Doe',
      favouriteColor: 'red',
      favouriteSport: 'running',
      age: 25,
    },
    where: whereComplicated,
    expected: false,
  },
  {
    name: 'returns false because not all or conditions are satisfied',
    data: {
      id: uuid(),
      name: 'John Doe',
      favouriteColor: 'green',
      favouriteSport: 'bouldering',
      age: 25,
    },
    where: whereComplicated,
    expected: false,
  },
]

const mappedCases: Array<[string, Omit<Case, 'name'>]> = cases.map(
  ({ name, ...rest }) => [name, rest],
)

describe('wherePredicateFn', () => {
  test.each(mappedCases)('%s', (_, { data, where, expected }) => {
    expect(wherePredicate(where._.raw)(data)).toBe(expected)
  })
})
