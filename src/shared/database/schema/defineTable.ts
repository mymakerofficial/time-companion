import { entriesOf, valuesOf } from '@shared/lib/utils/object'
import type {
  ColumnBuilder,
  ColumnDefinitionRaw,
  TableSchema,
} from '@shared/database/types/schema'
import { check, isDefined } from '@shared/lib/utils/checks'
import { createTableSchema } from '@shared/database/schema/tableSchema'

export function defineTable<TRow extends object>(
  tableName: string,
  columns: {
    [K in keyof TRow]: ColumnBuilder<TRow[K]>
  },
): TableSchema<TRow> {
  const columnsRaw = entriesOf(columns).reduce(
    (acc, [columnName, column]) => {
      acc[columnName] = {
        ...column._.raw,
        tableName,
        columnName: columnName as string,
      }

      return acc
    },
    {} as {
      [K in keyof TRow]: ColumnDefinitionRaw<TRow, TRow[K]>
    },
  )

  const primaryKey = valuesOf(columnsRaw).find((column) => column.isPrimaryKey)

  check(isDefined(primaryKey), 'Table must have a primary key column')

  return createTableSchema<TRow>({
    tableName,
    primaryKey: primaryKey.columnName,
    columns: columnsRaw,
  })
}
