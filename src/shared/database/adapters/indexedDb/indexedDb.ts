import type { Nullable } from '@shared/lib/utils/types'
import type {
  Database,
  Transaction,
  UpgradeTransaction,
} from '@shared/database/database'
import { IDBAdapterTransaction } from '@shared/database/adapters/indexedDb/transaction'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { IDBAdapterUpgradeTransaction } from '@shared/database/adapters/indexedDb/upgradeTransaction'

export class IDBAdapter implements Database {
  database: Nullable<IDBDatabase>

  constructor(private readonly indexedDB: IDBFactory = window.indexedDB) {
    this.database = null
  }

  async open(
    name: string,
    upgrade: (transaction: UpgradeTransaction) => Promise<void>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.indexedDB.open(name, 1)

      request.onerror = () => {
        reject(request.error)
      }

      request.onsuccess = () => {
        this.database = request.result
        resolve()
      }

      request.onupgradeneeded = async (event) => {
        await upgrade(new IDBAdapterUpgradeTransaction(request.result, event))
        resolve()
      }
    })
  }

  async withTransaction<TResult>(
    fn: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    check(isNotNull(this.database), 'Database is not open.')

    return await fn(new IDBAdapterTransaction(this.database))
  }
}

export function createIndexedDbAdapter(indexedDB?: IDBFactory): Database {
  return new IDBAdapter(indexedDB)
}
