import type {
  ColumnDefinition,
  TableSchema,
  TableSchemaBase,
  TableSchemaRaw,
} from '@database/types/schema'
import { ColumnDefinitionImpl } from '@database/schema/columnDefinition'
import { valuesOf } from '@shared/lib/utils/object'

class TableSchemaBaseImpl<T extends object> implements TableSchemaBase<T> {
  constructor(protected rawSchema: TableSchemaRaw<T>) {}

  get _() {
    return {
      raw: this.rawSchema,
    }
  }
}

export function createTableSchema<TRow extends object>(
  rawSchema: TableSchemaRaw<TRow>,
): TableSchema<TRow> {
  const base = new TableSchemaBaseImpl(rawSchema)

  return Object.assign(
    base,
    valuesOf(rawSchema.columns).reduce(
      (acc, column) => {
        acc[column.columnName as keyof TRow] = new ColumnDefinitionImpl(column)

        return acc
      },
      {} as {
        [K in keyof TRow]: ColumnDefinition<TRow, TRow[K]>
      },
    ),
  ) as TableSchema<TRow>
}
