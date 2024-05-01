import type {
  CreateTableArgs,
  UpgradeTable,
  UpgradeTransaction,
} from '@shared/database/types/database'
import { DatabaseTransactionImpl } from '@shared/database/factory/transaction'
import { DatabaseUpgradeTableImpl } from '@shared/database/factory/upgradeTable'

export class DatabaseUpgradeTransactionImpl
  extends DatabaseTransactionImpl
  implements UpgradeTransaction
{
  async createTable<TData extends object>(
    args: CreateTableArgs<TData>,
  ): Promise<UpgradeTable<TData>> {
    await this.transactionAdapter.createTable(
      args.name,
      args.primaryKey.toString(),
    )
    return this.table(args.name)
  }

  table<TData extends object>(tableName: string): UpgradeTable<TData> {
    const table = this.transactionAdapter.getTable<TData>(tableName)
    return new DatabaseUpgradeTableImpl(this.transactionAdapter, table)
  }
}
