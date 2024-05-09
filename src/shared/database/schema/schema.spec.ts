import { describe, it, expect, expectTypeOf } from 'vitest'
import {
  boolean,
  number,
  string,
  t,
} from '@shared/database/schema/columnBuilder'
import { defineTable } from '@shared/database/schema/defineTable'

describe('schema', () => {
  describe('columnBuilder', () => {
    it('should build a column', () => {
      expect(t.string().primaryKey()._.raw).toEqual({
        tableName: '',
        columnName: '',
        dataType: 'string',
        isPrimaryKey: true,
        isNullable: false,
      })
    })
  })

  describe('defineTable', () => {
    it('should define a table', () => {
      const foo = defineTable('foo', {
        id: string().primaryKey(),
        name: string(),
        color: string().nullable(),
      })

      expect(foo._.raw).toEqual({
        tableName: 'foo',
        primaryKey: 'id',
        columns: {
          id: {
            tableName: 'foo',
            columnName: 'id',
            dataType: 'string',
            isPrimaryKey: true,
            isNullable: false,
          },
          name: {
            tableName: 'foo',
            columnName: 'name',
            dataType: 'string',
            isPrimaryKey: false,
            isNullable: false,
          },
          color: {
            tableName: 'foo',
            columnName: 'color',
            dataType: 'string',
            isPrimaryKey: false,
            isNullable: true,
          },
        },
      })
    })
  })

  describe('whereBuilder', () => {
    it('should build a where clause', () => {
      const foo = defineTable('foo', {
        id: string().primaryKey(),
        name: string(),
        color: string().nullable(),
      })

      const where = foo.name
        .contains('John')
        .or(foo.name.contains('Jane'))
        .and(foo.color.isNotNull().or(foo.color.equals('red')))
        .or(foo.id.equals('123'))

      expect(where._.raw).toEqual({
        type: 'booleanGroup',
        booleanOperator: 'or',
        conditions: [
          {
            type: 'booleanGroup',
            booleanOperator: 'and',
            conditions: [
              {
                type: 'booleanGroup',
                booleanOperator: 'or',
                conditions: [
                  {
                    type: 'condition',
                    column: expect.objectContaining({ columnName: 'name' }),
                    operator: 'contains',
                    value: 'John',
                  },
                  {
                    type: 'condition',
                    column: expect.objectContaining({ columnName: 'name' }),
                    operator: 'contains',
                    value: 'Jane',
                  },
                ],
              },
              {
                type: 'booleanGroup',
                booleanOperator: 'or',
                conditions: [
                  {
                    type: 'condition',
                    column: expect.objectContaining({ columnName: 'color' }),
                    operator: 'isNotNull',
                    value: undefined,
                  },
                  {
                    type: 'condition',
                    column: expect.objectContaining({ columnName: 'color' }),
                    operator: 'equals',
                    value: 'red',
                  },
                ],
              },
            ],
          },
          {
            type: 'condition',
            column: expect.objectContaining({ columnName: 'id' }),
            operator: 'equals',
            value: '123',
          },
        ],
      })
    })
  })
})
