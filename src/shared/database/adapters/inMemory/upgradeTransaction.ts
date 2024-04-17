import type {
  CreateTableArgs,
  UpgradeTable,
  UpgradeTransaction,
} from '@shared/database/database'
import { InMemoryDatabaseUpgradeTable } from '@shared/database/adapters/inMemory/upgradeTable'
import { InMemoryDataTableImpl } from '@shared/database/adapters/inMemory/dataTable'
import { InMemoryDatabaseTransaction } from '@shared/database/adapters/inMemory/transaction'

export class InMemoryDatabaseUpgradeTransaction
  extends InMemoryDatabaseTransaction
  implements UpgradeTransaction
{
  async createTable<TData extends object>(
    args: CreateTableArgs<TData>,
  ): Promise<UpgradeTable<TData>> {
    return new Promise((resolve) => {
      const table = new InMemoryDataTableImpl(
        args.name,
        args.schema,
        args.primaryKey,
      )

      this.tables.set(args.name, table)

      resolve(new InMemoryDatabaseUpgradeTable(table))
    })
  }
}
