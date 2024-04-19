import type {
  Database,
  Transaction,
  UpgradeFunction,
} from '@shared/database/database'
import { InMemoryDatabaseTransaction } from '@shared/database/adapters/inMemory/transaction'
import { InMemoryDatabaseUpgradeTransaction } from '@shared/database/adapters/inMemory/upgradeTransaction'
import { emptyMap } from '@shared/lib/utils/list'
import type { InMemoryDataTables } from '@shared/database/adapters/inMemory/helpers/dataTable'
import { check, isDefined } from '@shared/lib/utils/checks'

class InMemoryDatabase implements Database {
  private readonly tables: InMemoryDataTables

  constructor() {
    this.tables = emptyMap()
  }

  async open(
    _: string,
    version: number,
    upgrade: UpgradeFunction,
  ): Promise<void> {
    return await upgrade(
      new InMemoryDatabaseUpgradeTransaction(this.tables),
      version,
      version,
    )
  }

  async withTransaction<TResult>(
    fn: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    return await fn(new InMemoryDatabaseTransaction(this.tables))
  }

  async getTableNames(): Promise<Array<string>> {
    return Promise.resolve(Array.from(this.tables.keys()).sort())
  }

  async getIndexes(tableName: string): Promise<Array<string>> {
    return new Promise((resolve) => {
      const table = this.tables.get(tableName)

      check(isDefined(table), `Table "${tableName}" does not exist.`)

      resolve(Array.from(table.getIndexes()).sort())
    })
  }
}

export function createInMemoryDatabase(): Database {
  return new InMemoryDatabase()
}
