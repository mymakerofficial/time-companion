import { describe, test, expect } from 'vitest'
import { wherePredicateFn } from '@shared/database/helpers/wherePredicateFn'
import type { WhereInput } from '@shared/database/database'

interface Person {
  name: string
  favouriteColor: string
  favouriteSport: string
  age: number
}

const whereComplicated: WhereInput<Person> = {
  AND: [
    {
      AND: [{ name: { contains: 'John' } }, { name: { contains: 'Doe' } }],
    },
    {
      OR: [
        { favouriteColor: { equals: 'red' } },
        { favouriteColor: { equals: 'blue' } },
      ],
    },
    {
      AND: [
        {
          age: { gte: 18 },
        },
        {
          age: { lt: 30 },
        },
      ],
    },
    {
      favouriteSport: { in: ['bouldering', 'cycling'] },
    },
  ],
}

interface Case {
  name: string
  data: Person
  where: WhereInput<Person>
  expected: boolean
}

const cases: Array<Case> = [
  {
    name: 'returns true because all conditions are satisfied perfectly',
    data: {
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
    expect(wherePredicateFn(data, where)).toBe(expected)
  })
})
