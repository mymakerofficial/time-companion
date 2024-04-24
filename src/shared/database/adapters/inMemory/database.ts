import type {
  Database,
  Transaction,
  UpgradeFunction,
} from '@shared/database/database'
import { InMemoryDatabaseTransaction } from '@shared/database/adapters/inMemory/transaction'
import { InMemoryDatabaseUpgradeTransaction } from '@shared/database/adapters/inMemory/upgradeTransaction'
import { emptyMap } from '@shared/lib/utils/list'
import type { InMemoryDataTables } from '@shared/database/adapters/inMemory/helpers/dataTable'
import { check, isDefined, isNotNull, isNull } from '@shared/lib/utils/checks'
import type { Nullable } from '@shared/lib/utils/types'

export class InMemoryDatabase implements Database {
  protected name: Nullable<string> = null
  protected version: Nullable<number> = null
  protected readonly tables: InMemoryDataTables = emptyMap()

  constructor() {}

  async open(
    name: string,
    version: number,
    upgrade: UpgradeFunction,
  ): Promise<void> {
    const oldVersion = this.version ?? 0

    if (isNull(this.name)) {
      this.name = name
    }

    if (isNull(this.version)) {
      this.version = version
    }

    if (version > oldVersion) {
      // TODO: call for each version incrementally
      return await upgrade(
        new InMemoryDatabaseUpgradeTransaction(this.tables),
        version,
        oldVersion,
      )
    }

    return Promise.resolve()
  }

  async close(): Promise<void> {
    this.name = null
    this.version = null
    this.tables.clear()
  }

  async delete(name: string): Promise<void> {
    check(name !== this.name, 'Cannot delete database that is currently open.')

    return Promise.resolve()
  }

  async withTransaction<TResult>(
    fn: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    check(isNotNull(this.name), 'Database is not open.')

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

export function createInMemoryDBAdapter(): Database {
  return new InMemoryDatabase()
}
