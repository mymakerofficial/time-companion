import type { TableSchemaRaw } from '@shared/database/types/schema'
import { entriesOf, keysOf } from '@shared/lib/utils/object'
import { isUndefined } from '@shared/lib/utils/checks'

export function rawTableSchemasMatch(
  tableA: TableSchemaRaw,
  tableB: TableSchemaRaw,
): boolean {
  if (tableA.tableName !== tableB.tableName) {
    return false
  }

  if (tableA.primaryKey !== tableB.primaryKey) {
    return false
  }

  if (keysOf(tableA.columns).length !== keysOf(tableB.columns).length) {
    return false
  }

  return !entriesOf(tableA.columns)
    .map(([columnName, columnA]) => {
      const columnB = tableB.columns[columnName]

      if (isUndefined(columnB)) {
        return false
      }

      return !entriesOf(columnA)
        .map(([key, value]) => {
          if (columnB[key] !== value) {
            return false
          }

          return true
        })
        .some((it) => !it)
    })
    .some((it) => !it)
}
