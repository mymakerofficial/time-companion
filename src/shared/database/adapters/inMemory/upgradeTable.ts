import type { CreateIndexArgs, UpgradeTable } from '@shared/database/database'
import { InMemoryDatabaseTable } from '@shared/database/adapters/inMemory/table'

export class InMemoryDatabaseUpgradeTable<TData extends object>
  extends InMemoryDatabaseTable<TData>
  implements UpgradeTable<TData>
{
  async createIndex(args: CreateIndexArgs<TData>): Promise<void> {
    return new Promise((resolve) => {
      this.table.createIndex(args)
      resolve()
    })
  }
}
