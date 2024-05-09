import type {
  UpgradeTable,
  UpgradeTransaction,
} from '@shared/database/types/database'
import { DatabaseTransactionImpl } from '@shared/database/factory/transaction'
import { DatabaseUpgradeTableImpl } from '@shared/database/factory/upgradeTable'
import type { TableSchema, InferTable } from '@shared/database/types/schema'
import { isString } from '@shared/lib/utils/checks'

export class DatabaseUpgradeTransactionImpl
  extends DatabaseTransactionImpl
  implements UpgradeTransaction
{
  async createTable<
    TData extends object = object,
    TSchema extends TableSchema<TData> = TableSchema<TData>,
  >(schema: TSchema): Promise<UpgradeTable<InferTable<TSchema>>> {
    await this.transactionAdapter.createTable(schema._.raw)
    return this.table(schema)
  }

  table<
    TData extends object = object,
    TSchema extends TableSchema<TData> = TableSchema<TData>,
  >(table: TSchema | string): UpgradeTable<InferTable<TSchema>> {
    const tableName = isString(table) ? table : table._.raw.tableName

    const tableAdapter =
      this.transactionAdapter.getTable<InferTable<TSchema>>(tableName)
    return new DatabaseUpgradeTableImpl(this.transactionAdapter, tableAdapter)
  }
}
