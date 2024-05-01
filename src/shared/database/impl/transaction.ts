import type { JoinedTable, Table, Transaction } from '@shared/database/database'
import type { DatabaseTransactionAdapter } from '@shared/database/adapter'
import { todo } from '@shared/lib/utils/todo'
import { DatabaseTableImpl } from '@shared/database/impl/table'

export class DatabaseTransactionImpl implements Transaction {
  constructor(
    protected readonly transactionAdapter: DatabaseTransactionAdapter,
  ) {}

  table<TData extends object>(tableName: string): Table<TData> {
    const table = this.transactionAdapter.getTable<TData>(tableName)
    return new DatabaseTableImpl(this.transactionAdapter, table)
  }

  join<TLeftData extends object, TRightData extends object>(
    leftTable: string,
    rightTable: string,
  ): JoinedTable<TLeftData, TRightData> {
    todo()
  }
}
