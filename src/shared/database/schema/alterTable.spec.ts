import { describe, expect, it } from 'vitest'
import { AlterTableBuilderImpl } from '@shared/database/schema/alterTable'

describe('alterTable', () => {
  it('should record the correct actions', async () => {
    const table = new AlterTableBuilderImpl()

    table.addColumn('name').string().nullable()
    table.dropColumn('age')
    table.renameColumn('email', 'emailAddress')
    table
      .alterColumn('emailAddress')
      .setDataType('string')
      .dropNullable()
      .setIndexed()
    table.renameTo('newTable')

    expect(table._.actions).toEqual([
      {
        type: 'addColumn',
        definition: expect.objectContaining({
          columnName: 'name',
          dataType: 'string',
          isPrimaryKey: false,
          isNullable: true,
          isIndexed: false,
          isUnique: false,
        }),
      },
      { type: 'dropColumn', columnName: 'age' },
      {
        type: 'renameColumn',
        columnName: 'email',
        newColumnName: 'emailAddress',
      },
      {
        type: 'alterColumn',
        columnName: 'emailAddress',
        action: { type: 'setDataType', dataType: 'string' },
      },
      {
        type: 'alterColumn',
        columnName: 'emailAddress',
        action: { type: 'setNullable', nullable: false },
      },
      {
        type: 'alterColumn',
        columnName: 'emailAddress',
        action: { type: 'setIndexed', indexed: true },
      },
      {
        type: 'renameTable',
        newTableName: 'newTable',
      },
    ])
  })
})