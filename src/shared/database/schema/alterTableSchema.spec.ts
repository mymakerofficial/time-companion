import { describe, expect, it } from 'vitest'
import { defineTable } from '@shared/database/schema/defineTable'
import { c } from '@shared/database/schema/columnBuilder'
import { applyAlterActions } from '@shared/database/schema/alterTableSchema'
import { AlterTableBuilderImpl } from '@shared/database/schema/alterTable'

describe('applyAlterActions', () => {
  it('should apply addColumn action', () => {
    const table = defineTable('foo', {
      id: c.uuid().primaryKey(),
      name: c.string(),
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
