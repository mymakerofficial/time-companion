import { describe, expect, it } from 'vitest'
import { defineTable } from '@database/schema/defineTable'
import { c } from '@database/schema/columnBuilder'
import { applyAlterActions } from '@database/schema/alterTableSchema'
import { AlterTableBuilderImpl } from '@database/schema/alterTable'

describe('applyAlterActions', () => {
  it('should apply addColumn action', () => {
    const table = defineTable('foo', {
      id: c.uuid().primaryKey(),
      name: c.text(),
    })._.raw

    const builder = new AlterTableBuilderImpl()

    builder.addColumn('age').integer()

    const newTable = applyAlterActions(table, builder._.actions)

    expect(newTable.columns).toEqual(
      expect.objectContaining({
        age: expect.objectContaining({
          tableName: 'foo',
          columnName: 'age',
          dataType: 'integer',
        }),
      }),
    )
  })
})
