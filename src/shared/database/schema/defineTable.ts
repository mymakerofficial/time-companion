import { entriesOf } from '@shared/lib/utils/object'
import type {
  DatabaseColumnDefinitionBuilder,
  DatabaseTableSchema,
  DatabaseTableSchemaRaw,
} from '@shared/database/types/schema'
import { check, isDefined } from '@shared/lib/utils/checks'

export function defineTable<TData extends object>(
  tableName: string,
  columns: {
    [K in keyof TData]: DatabaseColumnDefinitionBuilder<TData[K]>
  },
): DatabaseTableSchema<TData> {
  const columnsRaw = entriesOf(columns).map(([key, column]) => ({
    ...column.getRaw(),
    name: key.toString(),
  }))

  const primaryKey = columnsRaw.find((column) => column.isPrimaryKey)

  check(isDefined(primaryKey), 'Table must have a primary key column')

  return createTableSchema<TData>({
    tableName,
    primaryKey: primaryKey.name,
    columns: columnsRaw,
  })
}

function createTableSchema<TData extends object>(
  raw: DatabaseTableSchemaRaw<TData>,
): DatabaseTableSchema<TData> {
  return new Proxy(
    {},
    {
      // @ts-ignore
      get(target, prop: keyof DatabaseTableSchema<TData>) {
        if (prop === 'getRaw') {
          return () => raw
        }

        return Reflect.get(target, prop)
      },
    },
  ) as DatabaseTableSchema<TData>
}
