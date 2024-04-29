import type {
  CreateTableArgs,
  UpgradeTable,
  UpgradeTransaction,
} from '@shared/database/database'
import { DatabaseTransactionImpl } from '@shared/database/impl/transaction'
import { DatabaseUpgradeTableImpl } from '@shared/database/impl/upgradeTable'

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
    return new DatabaseUpgradeTableImpl(table)
  }
}
