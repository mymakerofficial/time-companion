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
import {
  check,
  isDefined,
  isNotNull,
  isUndefined,
} from '@shared/lib/utils/checks'
import { getOrDefault } from '@shared/lib/utils/result'

export function inMemoryDBAdapter(): DatabaseAdapter {
  return new InMemoryDatabaseAdapterImpl()
}

type DatabaseRecord = {
  info: DatabaseInfo
  tables: InMemoryDataTables
}

export class InMemoryDatabaseAdapterImpl implements DatabaseAdapter {
  protected openDatabaseName: Nullable<string> = null
  protected readonly databases: Map<string, DatabaseRecord> = emptyMap()

  protected getOpenDatabase(): DatabaseRecord {
    const databaseName = this.openDatabaseName
    check(isNotNull(databaseName), 'No database is open.')

    const databaseRecord = this.databases.get(databaseName)
    check(
      isDefined(databaseRecord),
      `Database "${databaseName}" does not exist.`,
    )

    return databaseRecord
  }

  async openDatabase(
    databaseName: string,
    version: number,
  ): Promise<Nullable<DatabaseTransactionAdapter>> {
    const databaseRecord = this.databases.get(databaseName)

    const needsUpgrade = version > getOrDefault(databaseRecord?.info.version, 0)

    if (isUndefined(databaseRecord)) {
      this.databases.set(databaseName, {
        info: { name: databaseName, version },
        tables: emptyMap(),
      })
    }

    this.openDatabaseName = databaseName
    this.getOpenDatabase().info.version = version

    if (needsUpgrade) {
      return await this.openTransaction([], 'versionchange')
    } else {
      return null
    }
  }

  closeDatabase(): Promise<void> {
    return new Promise((resolve) => {
      check(isNotNull(this.openDatabaseName), 'No database is open.')

      this.openDatabaseName = null
      resolve()
    })
  }

  deleteDatabase(databaseName: string): Promise<void> {
    return new Promise((resolve) => {
      check(
        this.databases.has(databaseName),
        `Database "${databaseName}" does not exist.`,
      )

      this.databases.delete(databaseName)
      resolve()
    })
  }

  openTransaction(
    tableNames: Array<string>,
    mode: DatabaseTransactionMode,
  ): Promise<DatabaseTransactionAdapter> {
    return Promise.resolve(
      new InMemoryDatabaseTransactionAdapterImpl(
        this.getOpenDatabase().tables,
        tableNames,
        mode,
      ),
    )
  }

  getDatabaseInfo(databaseName: string): Promise<Nullable<DatabaseInfo>> {
    return new Promise((resolve) => {
      const databaseRecord = this.databases.get(databaseName)

      if (isDefined(databaseRecord)) {
        resolve(databaseRecord.info)
      } else {
        resolve(null)
      }
    })
  }

  getDatabases(): Promise<Array<DatabaseInfo>> {
    return new Promise((resolve) => {
      const databases = toArray(this.databases.values())
        .map((it) => it.info)
        .sort((a, b) => a.name.localeCompare(b.name))

      resolve(databases)
    })
  }

  getTableNames(): Promise<Array<string>> {
    return Promise.resolve(toArray(this.getOpenDatabase().tables.keys()))
  }

  getTableIndexNames(tableName: string): Promise<Array<string>> {
    const dataTable = this.getOpenDatabase().tables.get(tableName)
    check(isDefined(dataTable), `Table "${tableName}" does not exist.`)
    return Promise.resolve(dataTable.getIndexNames())
  }
}
