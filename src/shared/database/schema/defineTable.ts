import { entriesOf, valuesOf } from '@shared/lib/utils/object'
import type {
  ColumnBuilder,
  ColumnDefinitionRaw,
  TableSchema,
} from '@database/types/schema'
import { check, isDefined, isNull } from '@shared/lib/utils/checks'
import { createTableSchema } from '@database/schema/tableSchema'

export function defineTable<TRow extends object>(
  tableName: string,
  columns: {
    [K in keyof TRow]: ColumnBuilder<TRow[K]>
  },
): TableSchema<TRow> {
  const columnsRaw = entriesOf(columns).reduce(
    (acc, [columnName, column]) => {
      check(
        isNull(column._.raw.tableName),
        'Column definition may not have a table name',
      )
      check(
        isNull(column._.raw.columnName),
        'Setting a separate column name is not yet supported in defineTable',
      )

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
    primaryKey: primaryKey.columnName!, // we know it has a column name because if it didn't we set it above
    columns: columnsRaw,
  })
}
