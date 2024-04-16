import type {
  ColumnType,
  CreateTableArgs,
  Database,
  Transaction,
  UpgradeTransaction,
} from '@shared/database/database'
import { InMemoryDatabaseTransaction } from '@shared/database/adapters/inMemory/transaction'
import { todo } from '@shared/lib/utils/todo'
import { InMemoryDatabaseUpgradeTransaction } from '@shared/database/adapters/inMemory/upgradeTransaction'
import { emptyMap } from '@shared/lib/utils/list'
import type { InMemoryDataTables } from '@shared/database/adapters/inMemory/dataTable'
import { check, isDefined } from '@shared/lib/utils/checks'

class InMemoryDatabase implements Database {
  private readonly tables: InMemoryDataTables

  constructor() {
    this.tables = emptyMap()
  }

  async open(
    _: string,
    upgrade: (transaction: UpgradeTransaction) => Promise<void>,
  ): Promise<void> {
    return await upgrade(new InMemoryDatabaseUpgradeTransaction(this.tables))
  }

  async withTransaction<TResult>(
    fn: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    return await fn(new InMemoryDatabaseTransaction(this.tables))
  }

  async getTableNames(): Promise<Array<string>> {
    return Promise.resolve(Array.from(this.tables.keys()))
  }

  async getIndexes(tableName: string): Promise<Array<string>> {
    return new Promise((resolve) => {
      const table = this.tables.get(tableName)

      check(isDefined(table), `Table "${tableName}" does not exist.`)

      resolve(Array.from(table.getIndexes()))
    })
  }
}

export function createInMemoryDatabase(): Database {
  return new InMemoryDatabase()
}
