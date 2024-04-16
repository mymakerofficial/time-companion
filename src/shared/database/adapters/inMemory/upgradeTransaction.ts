import type {
  CreateTableArgs,
  UpgradeTable,
  UpgradeTransaction,
} from '@shared/database/database'
import { InMemoryDatabaseUpgradeTable } from '@shared/database/adapters/inMemory/upgradeTable'

export class InMemoryDatabaseUpgradeTransaction implements UpgradeTransaction {
  constructor(private data: Map<string, Array<object>>) {}

  async createTable<TData extends object>(
    args: CreateTableArgs<TData>,
  ): Promise<UpgradeTable<TData>> {
    return new Promise((resolve) => {
      this.data.set(args.name, [])

      resolve(new InMemoryDatabaseUpgradeTable())
    })
  }
}
