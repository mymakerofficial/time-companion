import { describe, expect, it } from 'vitest'
import { c } from '@database/schema/columnBuilder'
import { defineTable } from '@database/schema/defineTable'
import { orderByDirections } from '@database/types/database'

describe('schema', () => {
  describe('columnBuilder', () => {
    it('should build a column', () => {
      expect(c.text().primaryKey()._.raw).toEqual({
        tableName: null,
        columnName: null,
        dataType: 'text',
        isPrimaryKey: true,
        isNullable: false,
        isIndexed: false,
        isUnique: false,
      })
    })
  })

  describe('magic', () => {
    it('should result in a correct builder', () => {
      const res = c('foo', 'bar').text().nullable().equals('baz')

      expect(res).toEqual({
        column: {
          tableName: 'foo',
          columnName: 'bar',
          dataType: 'text',
          isPrimaryKey: false,
          isNullable: true,
          isIndexed: false,
          isUnique: false,
        },
        operator: 'equals',
        value: 'baz',
      })
    })
  })

  describe('defineTable', () => {
    it('should define a table', () => {
      const foo = defineTable('foo', {
        id: c.uuid().primaryKey(),
        name: c.text().indexed(),
        karma: c.integer().nullable(),
      })

      expect(foo._.raw).toEqual({
        tableName: 'foo',
        primaryKey: 'id',
        columns: {
          id: {
            tableName: 'foo',
            columnName: 'id',
            dataType: 'uuid',
            isPrimaryKey: true,
            isNullable: false,
            isIndexed: false,
            isUnique: false,
          },
          name: {
            tableName: 'foo',
            columnName: 'name',
            dataType: 'text',
            isPrimaryKey: false,
            isNullable: false,
            isIndexed: true,
            isUnique: false,
          },
          karma: {
            tableName: 'foo',
            columnName: 'karma',
            dataType: 'integer',
            isPrimaryKey: false,
            isNullable: true,
            isIndexed: false,
            isUnique: false,
          },
        },
      })
    })
  })

  describe('whereBuilder', () => {
    it('should build a where clause', () => {
      const foo = defineTable('foo', {
        id: c.text().primaryKey(),
        name: c.text(),
        color: c.text().nullable(),
      })

      const where = foo.name
        .contains('John')
        .or(foo.name.contains('Jane'))
        .or(foo.name.contains('James'))
        .and(foo.name.contains('Doe'))
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
                  {
                    type: 'condition',
                    column: expect.objectContaining({ columnName: 'name' }),
                    operator: 'contains',
                    value: 'James',
                  },
                ],
              },
              {
                type: 'condition',
                column: expect.objectContaining({ columnName: 'name' }),
                operator: 'contains',
                value: 'Doe',
              },
              {
                type: 'booleanGroup',
                booleanOperator: 'or',
                conditions: [
                  {
                    type: 'condition',
                    column: expect.objectContaining({ columnName: 'color' }),
                    operator: 'notEquals',
                    value: null,
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

  describe('orderBy', () => {
    it.each(orderByDirections)('should return an %s order by', (direction) => {
      const foo = defineTable('foo', {
        id: c.text().primaryKey(),
        name: c.text().indexed(),
      })

      expect(foo.name[direction]()).toEqual({
        column: expect.objectContaining({ columnName: 'name' }),
        direction: direction,
      })
    })
  })
})
