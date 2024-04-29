import type {
  DatabaseAdapter,
  DatabaseInfo,
  DatabaseTransactionAdapter,
  DatabaseTransactionMode,
} from '@shared/database/adapter'
import type { InMemoryDataTables } from '@shared/database/adapters/inMemory/helpers/dataTable'
import { emptyMap, toArray } from '@shared/lib/utils/list'
import { todo } from '@shared/lib/utils/todo'
import type { Nullable } from '@shared/lib/utils/types'
import { InMemoryDatabaseTransactionAdapterImpl } from '@shared/database/adapters/inMemory/transaction'
import { check, isDefined } from '@shared/lib/utils/checks'

export function inMemoryDBAdapter(): DatabaseAdapter {
  return new InMemoryDatabaseAdapterImpl()
}

export class InMemoryDatabaseAdapterImpl implements DatabaseAdapter {
  protected databaseName: Nullable<string> = null
  protected version: Nullable<number> = null
  protected readonly tables: InMemoryDataTables = emptyMap()

  async openDatabase(
    databaseName: string,
    version: number,
  ): Promise<Nullable<DatabaseTransactionAdapter>> {
    return await this.openTransaction([], 'versionchange')

    // TODO upgrade
  }

  async closeDatabase(): Promise<void> {
    todo()
  }

  async deleteDatabase(name: string): Promise<void> {
    todo()
  }

  openTransaction(
    tableNames: Array<string>,
    mode: DatabaseTransactionMode,
  ): Promise<DatabaseTransactionAdapter> {
    return Promise.resolve(
      new InMemoryDatabaseTransactionAdapterImpl(this.tables, tableNames, mode),
    )
  }

  getDatabaseInfo(databaseName: string): Promise<Nullable<DatabaseInfo>> {
    return Promise.resolve(null)
  }

  getDatabases(): Promise<Array<DatabaseInfo>> {
    todo()
  }

  getTableNames(): Promise<Array<string>> {
    return Promise.resolve(toArray(this.tables.keys()))
  }

  getTableIndexNames(tableName: string): Promise<Array<string>> {
    const dataTable = this.tables.get(tableName)
    check(isDefined(dataTable), `Table "${tableName}" does not exist.`)
    return Promise.resolve(dataTable.getIndexNames())
  }
}
