import { entriesOf, valuesOf } from '@shared/lib/utils/object'
import type {
  ColumnBuilder,
  ColumnDefinitionRaw,
  TableSchema,
} from '@shared/database/types/schema'
import { check, isDefined } from '@shared/lib/utils/checks'
import { createTableSchema } from '@shared/database/schema/tableSchema'

export function defineTable<TData extends object>(
  tableName: string,
  columns: {
    [K in keyof TData]: ColumnBuilder<TData[K]>
  },
): TableSchema<TData> {
  const columnsRaw = entriesOf(columns).reduce(
    (acc, [columnName, column]) => {
      acc[columnName] = {
        ...column._.raw,
        tableName,
        columnName: columnName as string,
      }

      return acc
    },
    {} as Record<keyof TData, ColumnDefinitionRaw<unknown>>,
  )

  const primaryKey = valuesOf(columnsRaw).find((column) => column.isPrimaryKey)

  check(isDefined(primaryKey), 'Table must have a primary key column')

  return createTableSchema<TData>({
    tableName,
    primaryKey: primaryKey.columnName,
    columns: columnsRaw,
  })
}
