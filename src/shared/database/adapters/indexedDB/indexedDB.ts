import type { Nullable } from '@shared/lib/utils/types'
import type {
  Database,
  Transaction,
  UpgradeFunction,
  UpgradeTransaction,
} from '@shared/database/database'
import { IDBAdapterTransaction } from '@shared/database/adapters/indexedDB/transaction'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { IDBAdapterUpgradeTransaction } from '@shared/database/adapters/indexedDB/upgradeTransaction'

export class IDBAdapter implements Database {
  database: Nullable<IDBDatabase>

  constructor(private readonly indexedDB: IDBFactory = window.indexedDB) {
    this.database = null
  }

  private async openDatabaseAtVersion(
    name: string,
    version: number,
    upgrade: UpgradeFunction,
  ): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = this.indexedDB.open(name, version)

      request.onerror = () => {
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onupgradeneeded = async (event) => {
        const upgradeTransaction: UpgradeTransaction =
          new IDBAdapterUpgradeTransaction(request.result, event)

        await upgrade(
          upgradeTransaction,
          event.newVersion ?? 0,
          event.oldVersion,
        )

        // don't resolve here, we only know the upgrade is done when onsuccess is called
      }
    })
  }

  // recursively opens the database at each version from openVersion to targetVersion,
  //  and returns the database when done.
  private async openDatabaseVersionsIncrementally(
    name: string,
    openVersion: number,
    targetVersion: number,
    upgrade: UpgradeFunction,
  ): Promise<IDBDatabase> {
    // we need to open the database at each version incrementally
    //  to ensure that the upgrade function is called at each version

    const database = await this.openDatabaseAtVersion(
      name,
      openVersion,
      upgrade,
    )

    if (openVersion !== targetVersion) {
      // if we are not at the target version, close, open next version and run upgrade
      database.close()
      const nextVersion = openVersion + 1
      return await this.openDatabaseVersionsIncrementally(
        name,
        nextVersion,
        targetVersion,
        upgrade,
      )
    } else {
      // we have reached the target version!
      return database
    }
  }

  async open(
    name: string,
    version: number,
    upgrade: UpgradeFunction,
  ): Promise<void> {
    const databases = await this.indexedDB.databases()

    const currentVersion =
      databases.find((db) => db.name === name)?.version ?? 0

    check(version >= 1, 'Version must be greater than or equal to 1.')

    check(
      version >= currentVersion,
      `Cannot open database with version "${version}" which is lower than the current version "${currentVersion}".`,
    )

    let openVersion = Math.max(currentVersion, 1)

    this.database = await this.openDatabaseVersionsIncrementally(
      name,
      openVersion,
      version,
      upgrade,
    )
  }

  async withTransaction<TResult>(
    fn: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    check(isNotNull(this.database), 'Database is not open.')

    return await fn(new IDBAdapterTransaction(this.database))
  }

  async getTableNames(): Promise<Array<string>> {
    check(isNotNull(this.database), 'Database is not open.')

    return Promise.resolve(Array.from(this.database.objectStoreNames))
  }

  async getIndexes(tableName: string): Promise<Array<string>> {
    check(isNotNull(this.database), 'Database is not open.')

    const transaction = this.database.transaction(tableName)
    const store = transaction.objectStore(tableName)

    return Promise.resolve(Array.from(store.indexNames))
  }
}

export function createIndexedDBAdapter(indexedDB?: IDBFactory): Database {
  return new IDBAdapter(indexedDB)
}
