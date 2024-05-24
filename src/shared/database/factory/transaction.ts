import type { Table, Transaction } from '@shared/database/types/database'
import type { TransactionAdapter } from '@shared/database/types/adapter'
import { DatabaseTableImpl } from '@shared/database/factory/table'
import type { InferTable, TableSchema } from '@shared/database/types/schema'
import { isString } from '@shared/lib/utils/checks'

export class DatabaseTransactionImpl implements Transaction {
  constructor(protected readonly transactionAdapter: TransactionAdapter) {}

  table<
    TRow extends object = object,
    TSchema extends TableSchema<TRow> = TableSchema<TRow>,
  >(table: TSchema | string): Table<InferTable<TSchema>> {
    const tableName = isString(table) ? table : table._.raw.tableName

    const tableAdapter =
      this.transactionAdapter.getTable<InferTable<TSchema>>(tableName)
    return new DatabaseTableImpl(tableAdapter)
  }
}
