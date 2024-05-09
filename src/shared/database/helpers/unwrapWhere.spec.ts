import { expect, test } from 'vitest'
import type { WhereInput } from '@shared/database/types/database'
import {
  type UnwrapWhere,
  unwrapWhere,
} from '@shared/database/helpers/unwrapWhere'

interface Person {
  name: string
  favouriteColor: string
  age: number
}

test('unwrapWhere unwraps a where object correctly', () => {
  const where: WhereInput<Person> = {
    and: [
      {
        and: [{ name: { contains: 'John' } }, { name: { contains: 'Doe' } }],
      },
      {
        or: [
          { favouriteColor: { equals: 'red' } },
          { favouriteColor: { equals: 'blue' } },
        ],
      },
      {
        age: { gte: 18 },
      },
    ],
  }

  const unwrapped = unwrapWhere<Person>(where)

  expect(unwrapped).toEqual({
    type: 'booleanGroup',
    booleanOperator: 'and',
    conditions: [
      {
        type: 'booleanGroup',
        booleanOperator: 'and',
        conditions: [
          {
            type: 'condition',
            key: 'name',
            operator: 'contains',
            value: 'John',
          },
          {
            type: 'condition',
            key: 'name',
            operator: 'contains',
            value: 'Doe',
          },
        ],
      },
      {
        type: 'booleanGroup',
        booleanOperator: 'or',
        conditions: [
          {
            type: 'condition',
            key: 'favouriteColor',
            operator: 'equals',
            value: 'red',
          },
          {
            type: 'condition',
            key: 'favouriteColor',
            operator: 'equals',
            value: 'blue',
          },
        ],
      },
      {
        type: 'condition',
        key: 'age',
        operator: 'gte',
        value: 18,
      },
    ],
  } as UnwrapWhere<Person>)
})
