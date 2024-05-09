import { describe, it, expect } from 'vitest'
import { t } from '@shared/database/schema/columnBuilder'
import { defineTable } from '@shared/database/schema/defineTable'

describe('schema', () => {
  describe('columnBuilder', () => {
    it('should build a column', () => {
      expect(t.string().primaryKey().getRaw()).toEqual({
        name: '',
        type: 'string',
        isPrimaryKey: true,
        isNullable: false,
      })
    })
  })

  describe('defineTable', () => {
    it('should define a table', () => {
      const foo = defineTable('foo', {
        id: t.string().primaryKey(),
        name: t.string(),
      })

      expect(foo.getRaw()).toEqual({
        tableName: 'foo',
        primaryKey: 'id',
        columns: [
          {
            name: 'id',
            type: 'string',
            isPrimaryKey: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'string',
            isPrimaryKey: false,
            isNullable: false,
          },
        ],
      })
    })
  })
})
