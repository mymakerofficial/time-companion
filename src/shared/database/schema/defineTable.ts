import { entriesOf } from '@shared/lib/utils/object'
import type {
  DatabaseColumnDefinitionInput,
  DatabaseTableSchema,
} from '@shared/database/types/schema'
import { check, isDefined } from '@shared/lib/utils/checks'

export function defineTable<TData extends object>(
  tableName: string,
  columns: {
    [K in keyof TData]: DatabaseColumnDefinitionInput<TData[K]>
  },
): DatabaseTableSchema<TData> {
  const columnsRaw = entriesOf(columns).map(([key, column]) => ({
    name: key.toString(),
    ...column,
  }))

  const primaryKey = columnsRaw.find((column) => column.isPrimaryKey)

  check(isDefined(primaryKey), 'Table must have a primary key column')

  return {
    _raw: {
      tableName,
      primaryKey: primaryKey.name,
      columns: columnsRaw,
    },
  }
}
