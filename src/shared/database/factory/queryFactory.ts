import type { QueryFactory, Table } from '@database/types/database'
import type {
  InferTable,
  TableSchema,
  TableSchemaRaw,
} from '@database/types/schema'
import { isString } from '@shared/lib/utils/checks'
import { DatabaseTableImpl } from '@database/factory/table'
import type { TableAdapterFactory } from '@database/types/adapter'
import type { Optional } from '@shared/lib/utils/types'

export class DatabaseQuertyFactoryImpl implements QueryFactory {
  constructor(
    protected readonly tableAdapter: TableAdapterFactory,
    protected readonly runtimeSchema: Map<string, TableSchemaRaw>,
  ) {}

  table<
    TRow extends object = object,
    TSchema extends TableSchema<TRow> = TableSchema<TRow>,
  >(table: TSchema | string): Table<InferTable<TSchema>> {
    const tableName = isString(table) ? table : table._.raw.tableName
    const tableSchema = this.runtimeSchema.get(tableName) as Optional<
      TableSchemaRaw<InferTable<TSchema>>
    >

    const tableAdapter = this.tableAdapter.getTable<InferTable<TSchema>>(
      tableName,
      tableSchema,
    )
    return new DatabaseTableImpl(tableAdapter, tableSchema)
  }
}
