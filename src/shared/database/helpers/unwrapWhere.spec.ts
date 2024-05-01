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
        age: { gte: 18 },
      },
    ],
  }

  const unwrapped = unwrapWhere<Person>(where)

  expect(unwrapped).toEqual({
    type: 'booleanGroup',
    booleanOperator: 'AND',
    conditions: [
      {
        type: 'booleanGroup',
        booleanOperator: 'AND',
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
        booleanOperator: 'OR',
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
