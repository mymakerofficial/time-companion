import type {
  ColumnDefinition,
  TableSchema,
  TableSchemaBase,
  TableSchemaRaw,
} from '@shared/database/types/schema'
import { createColumnDefinition } from '@shared/database/schema/columnDefinition'
import { valuesOf } from '@shared/lib/utils/object'

class TableSchemaBaseImpl<T extends object> implements TableSchemaBase<T> {
  constructor(protected rawSchema: TableSchemaRaw<T>) {}

  get _() {
    return {
      raw: this.rawSchema,
    }
  }
}

export function createTableSchema<T extends object>(
  rawSchema: TableSchemaRaw<T>,
): TableSchema<T> {
  const base = new TableSchemaBaseImpl(rawSchema)

  return Object.assign(
    base,
    valuesOf(rawSchema.columns).reduce(
      (acc, column) => {
        acc[column.columnName] = createColumnDefinition(column)

        return acc
      },
      {} as Record<string, ColumnDefinition<unknown>>,
    ),
  ) as TableSchema<T>
}
