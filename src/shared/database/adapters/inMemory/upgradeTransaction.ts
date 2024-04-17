import type {
  CreateTableArgs,
  UpgradeTable,
  UpgradeTransaction,
} from '@shared/database/database'
import { InMemoryDatabaseUpgradeTable } from '@shared/database/adapters/inMemory/upgradeTable'
import {
  type InMemoryDataTable,
  InMemoryDataTableImpl,
} from '@shared/database/adapters/inMemory/dataTable'
import { InMemoryDatabaseTransaction } from '@shared/database/adapters/inMemory/transaction'
import type { Optional } from '@shared/lib/utils/types'
import { check, isDefined } from '@shared/lib/utils/checks'

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

  table<TData extends object>(tableName: string): UpgradeTable<TData> {
    const table = this.tables.get(tableName) as Optional<
      InMemoryDataTable<TData>
    >

    check(isDefined(table), `Table "${tableName}" does not exist.`)

    return new InMemoryDatabaseUpgradeTable<TData>(table)
  }
}
