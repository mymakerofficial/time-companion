import type { CreateIndexArgs, UpgradeTable } from '@shared/database/database'
import { DatabaseTableImpl } from '@shared/database/impl/table'

export class DatabaseUpgradeTableImpl<TData extends object>
  extends DatabaseTableImpl<TData>
  implements UpgradeTable<TData>
{
  async createIndex(args: CreateIndexArgs<TData>): Promise<void> {
    await this.tableAdapter.createIndex(
      args.keyPath.toString(),
      args.unique ?? false,
    )
  }
}