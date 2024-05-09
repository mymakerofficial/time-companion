import type {
  JoinedTable,
  Table,
  Transaction,
} from '@shared/database/types/database'
import type { DatabaseTransactionAdapter } from '@shared/database/types/adapter'
import { todo } from '@shared/lib/utils/todo'
import { DatabaseTableImpl } from '@shared/database/factory/table'
import type {
  DatabaseTableSchema,
  InferTableType,
} from '@shared/database/types/schema'
import { isString } from '@shared/lib/utils/checks'

export class DatabaseTransactionImpl implements Transaction {
  constructor(
    protected readonly transactionAdapter: DatabaseTransactionAdapter,
  ) {}

  table<
    TData extends object = object,
    TSchema extends DatabaseTableSchema<TData> = DatabaseTableSchema<TData>,
  >(table: TSchema | string): Table<InferTableType<TSchema>> {
    const tableName = isString(table) ? table : table.getRaw().tableName

    const tableAdapter =
      this.transactionAdapter.getTable<InferTableType<TSchema>>(tableName)
    return new DatabaseTableImpl(this.transactionAdapter, tableAdapter)
  }

  join<TLeftData extends object, TRightData extends object>(
    leftTable: string,
    rightTable: string,
  ): JoinedTable<TLeftData, TRightData> {
    todo()
  }
}
