import type { Nullable } from '@shared/lib/utils/types'
import type {
  AdapterUpgradeFunction,
  DatabaseAdapter,
  DatabaseInfo,
  DatabaseTransactionAdapter,
  DatabaseTransactionMode,
} from '@shared/database/types/adapter'
import { IndexedDBDatabaseTransactionAdapterImpl } from '@shared/database/adapters/indexedDB/adapter/transaction'
import {
  check,
  isNotEmpty,
  isNotNull,
  isNull,
  isUndefined,
} from '@shared/lib/utils/checks'
import { toArray } from '@shared/lib/utils/list'
import { todo } from '@shared/lib/utils/todo'

export function indexedDBAdapter(indexedDB?: IDBFactory): DatabaseAdapter {
  return new IndexedDBDatabaseAdapterImpl(indexedDB)
}

export class IndexedDBDatabaseAdapterImpl implements DatabaseAdapter {
  protected database: Nullable<IDBDatabase>

  constructor(private readonly indexedDB: IDBFactory = window.indexedDB) {
    this.database = null
  }

  async openDatabase(
    name: string,
    version: number,
    upgrade: AdapterUpgradeFunction,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.indexedDB.open(name, version)

      request.onerror = () => {
        reject(request.error)
      }

      request.onsuccess = () => {
        this.database = request.result
        resolve()
      }

      request.onupgradeneeded = async (event) => {
        // get the current transaction... i don't think this is even documented anywhere
        // thanks https://stackoverflow.com/a/21078740

        // @ts-expect-error
        const transaction = event.target.transaction

        const transactionAdapter: DatabaseTransactionAdapter =
          new IndexedDBDatabaseTransactionAdapterImpl(
            request.result,
            transaction,
            [],
            'versionchange',
          )

        await upgrade(transactionAdapter)

        // don't resolve here, we only know the upgrade is done when onsuccess is called
      }
    })
  }

  closeDatabase(): Promise<void> {
    return new Promise((resolve) => {
      check(isNotNull(this.database), 'No database is open.')

      this.database.close()
      this.database = null
      resolve()
    })
  }

  deleteDatabase(databaseName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.indexedDB.deleteDatabase(databaseName)

      request.onerror = () => {
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  openTransaction(
    tableNames: Array<string>,
    mode: DatabaseTransactionMode,
  ): Promise<DatabaseTransactionAdapter> {
    return new Promise((resolve) => {
      check(isNotNull(this.database), 'Database is not open.')

      check(
        mode !== 'versionchange',
        'Cannot open transaction with mode "versionchange".',
      )

      check(isNotEmpty(tableNames), 'Table names must not be empty.')

      const transaction = this.database.transaction(tableNames, mode)

      resolve(
        new IndexedDBDatabaseTransactionAdapterImpl(
          this.database,
          transaction,
          tableNames,
          mode,
        ),
      )
    })
  }

  async getDatabaseInfo(databaseName: string): Promise<Nullable<DatabaseInfo>> {
    const databases = await this.indexedDB.databases()

    const database = databases.find((it) => it.name === databaseName)

    if (isUndefined(database)) {
      return null
    }

    return { name: databaseName, version: database.version ?? 0 }
  }

  async getDatabases(): Promise<Array<DatabaseInfo>> {
    const databases = await this.indexedDB.databases()

    return databases
      .map((it) => ({
        name: it.name!,
        version: it.version!,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  getTableNames(): Promise<Array<string>> {
    return new Promise((resolve) => {
      check(isNotNull(this.database), 'Database is not open.')

      resolve(toArray(this.database.objectStoreNames))
    })
  }

  getTableIndexNames(tableName: string): Promise<Array<string>> {
    todo()
  }
}
