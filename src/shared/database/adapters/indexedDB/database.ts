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
import {
  DatabaseNotOpenError,
  DatabaseVersionTooHighError,
} from '@shared/database/types/errors'

export function indexedDBAdapter(
  databaseName: string,
  indexedDB?: IDBFactory,
): DatabaseAdapter {
  return new IdbDatabaseAdapter(databaseName, indexedDB)
}

export class IdbDatabaseAdapter implements DatabaseAdapter {
  protected database: Nullable<IDBDatabase>

  constructor(
    private readonly databaseName: string,
    private readonly indexedDB: IDBFactory = globalThis.indexedDB,
  ) {
    this.database = null
  }

  get isOpen(): boolean {
    return isNotNull(this.database)
  }

  openDatabase(): Promise<DatabaseInfo> {
    return new Promise(async (resolve, reject) => {
      const databases = await this.indexedDB.databases()
      const databaseInfo = databases.find((it) => it.name === this.databaseName)

      const currentVersion = databaseInfo?.version ? databaseInfo.version : 1

      const request = this.indexedDB.open(this.databaseName, currentVersion)

      request.onerror = () => {
        reject(request.error)
      }

      request.onsuccess = () => {
        this.database = request.result

        resolve({
          version: this.database.version,
        })
      }

      request.onupgradeneeded = async () => {}
    })
  }

  async openMigration(targetVersion: number): Promise<TransactionAdapter> {
    return new Promise(async (resolve, reject) => {
      check(isNotNull(this.database), () => new DatabaseNotOpenError())
      check(
        this.database.version < targetVersion,
        () =>
          new DatabaseVersionTooHighError(
            this.database!.version - 1,
            targetVersion - 1,
          ),
      )

      this.database.close()
      this.database = null

      const request = this.indexedDB.open(this.databaseName, targetVersion)

      request.onerror = () => {
        reject(request.error)
      }

      request.onsuccess = () => {
        this.database = request.result
      }

      request.onupgradeneeded = async (event) => {
        // get the current transaction... i don't think this is even documented anywhere
        // thanks https://stackoverflow.com/a/21078740
        // @ts-expect-error
        const transaction = event.target.transaction
        // this is cheating
        this.database = transaction.db

        const transactionAdapter: TransactionAdapter =
          new IdbDatabaseTransactionAdapter(
            transaction.db,
            transaction,
            'versionchange',
          )

        resolve(transactionAdapter)
      }
    })
  }

  closeDatabase(): Promise<void> {
    return new Promise((resolve) => {
      check(isNotNull(this.database), () => new DatabaseNotOpenError())

      this.database.close()
      this.database = null
      resolve()
    })
  }

  protected openTransactionSync(): TransactionAdapter {
    check(isNotNull(this.database), () => new DatabaseNotOpenError())

    const transaction = this.database.transaction(
      this.database.objectStoreNames,
      'readwrite',
    )

    return new IdbDatabaseTransactionAdapter(
      this.database,
      transaction,
      'readwrite',
    )
  }

  openTransaction(): Promise<TransactionAdapter> {
    return Promise.resolve(this.openTransactionSync())
  }

  getTable<TRow extends object>(tableName: string): TableAdapter<TRow> {
    return this.openTransactionSync().getTable(tableName)
  }

  async getDatabaseInfo(): Promise<Nullable<DatabaseInfo>> {
    const databases = await this.indexedDB.databases()
    const database = databases.find((it) => it.name === this.databaseName)

    if (isUndefined(database)) {
      return null
    }

    return { version: database.version ?? 0 }
  }

  getTableNames(): Promise<Array<string>> {
    return new Promise((resolve) => {
      check(isNotNull(this.database), () => new DatabaseNotOpenError())

      resolve(toArray(this.database.objectStoreNames))
    })
  }

  truncateDatabase(): Promise<void> {
    return new Promise(async (resolve) => {
      check(isNotNull(this.database), () => new DatabaseNotOpenError())

      await this.closeDatabase()

      const request = this.indexedDB.deleteDatabase(this.databaseName)

      request.onsuccess = async () => {
        await this.openDatabase()
        resolve()
      }
    })
  }
}
