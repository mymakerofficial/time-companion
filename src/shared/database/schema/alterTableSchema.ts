import type { AlterTableAction, TableSchemaRaw } from '@database/types/schema'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { todo } from '@shared/lib/utils/todo'

export function applyAlterActions(
  schema: TableSchemaRaw,
  actions: Array<AlterTableAction>,
): TableSchemaRaw {
  const newSchema = { ...schema }

  for (const action of actions) {
    switch (action.type) {
      case 'addColumn': {
        check(
          isNotNull(action.definition.columnName),
          'Column name may not be null',
        )

        action.definition.tableName = newSchema.tableName
        newSchema.columns[action.definition.columnName] = action.definition
        break
      }
      case 'alterColumn': {
        todo()
        break
      }
      case 'dropColumn': {
        delete newSchema.columns[action.columnName]
        break
      }
      case 'renameColumn': {
        const column = newSchema.columns[action.columnName]
        delete newSchema.columns[action.columnName]
        newSchema.columns[action.newColumnName] = column
        column.columnName = action.newColumnName
        break
      }
      case 'renameTable': {
        newSchema.tableName = action.newTableName
        break
      }
    }
  }

  return newSchema
}
