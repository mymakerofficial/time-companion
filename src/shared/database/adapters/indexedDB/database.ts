import type { Nullable } from '@shared/lib/utils/types'
import type {
  DatabaseAdapter,
  DatabaseInfo,
  TableAdapter,
  TransactionAdapter,
} from '@shared/database/types/adapter'
import { IdbDatabaseTransactionAdapter } from '@shared/database/adapters/indexedDB/transaction'
import { check, isNotNull, isUndefined } from '@shared/lib/utils/checks'
import { toArray } from '@shared/lib/utils/list'
import { todo } from '@shared/lib/utils/todo'
import { IdbTableAdapter } from '@shared/database/adapters/indexedDB/table'

export function indexedDBAdapter(indexedDB?: IDBFactory): DatabaseAdapter {
  return new IdbDatabaseAdapter(indexedDB)
}

export class IdbDatabaseAdapter implements DatabaseAdapter {
  protected database: Nullable<IDBDatabase>

  constructor(private readonly indexedDB: IDBFactory = window.indexedDB) {
    this.database = null
  }

  get isOpen(): boolean {
    return isNotNull(this.database)
  }

  openDatabase(
    name: string,
    version: number,
  ): Promise<Nullable<TransactionAdapter>> {
    return new Promise((resolve, reject) => {
      const request = this.indexedDB.open(name, version)

      request.onerror = () => {
        reject(request.error)
      }

      request.onsuccess = () => {
        this.database = request.result
        resolve(null)
      }

      request.onupgradeneeded = async (event) => {
        // get the current transaction... i don't think this is even documented anywhere
        // thanks https://stackoverflow.com/a/21078740

        this.database = request.result

        // @ts-expect-error
        const transaction = event.target.transaction

        const transactionAdapter: TransactionAdapter =
          new IdbDatabaseTransactionAdapter(
            request.result,
            transaction,
            'versionchange',
          )

        resolve(transactionAdapter)
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

  openTransaction(): Promise<TransactionAdapter> {
    return new Promise((resolve) => {
      check(isNotNull(this.database), 'Database is not open.')

      const transaction = this.database.transaction(
        this.database.objectStoreNames,
        'readwrite',
      )

      resolve(
        new IdbDatabaseTransactionAdapter(
          this.database,
          transaction,
          'readwrite',
        ),
      )
    })
  }

  getTable<TData extends object>(tableName: string): TableAdapter<TData> {
    todo()
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
