import type { Nullable } from '@shared/lib/utils/types'
import type {
  Database,
  Transaction,
  UpgradeTransaction,
} from '@shared/database/database'
import { IDBAdapterTransaction } from '@shared/database/adapters/indexedDb/transaction'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { IDBAdapterUpgradeTransaction } from '@shared/database/adapters/indexedDb/upgradeTransaction'

// make sure this file is only imported in a browser environment
check(
  typeof window !== 'undefined',
  import.meta.env.DEV
    ? 'AAAAAAAAAAA!!! IDBAdapter was imported in a non-browser environment! Please make sure its only imported by code inside the render module!'
    : 'IDBAdapter was imported in a non-browser environment.',
)

// make sure IndexedDB is available
//  yes this will crash the app if IndexedDB is not available
check(
  typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined',
  'IndexedDB is not available. Please try a different browser.',
)

export class IDBAdapter implements Database {
  database: Nullable<IDBDatabase>

  constructor() {
    this.database = null
  }

  async open(
    name: string,
    upgrade: (transaction: UpgradeTransaction) => Promise<void>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(name, 1)

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

export function createIndexedDbAdapter(): Database {
  return new IDBAdapter()
}
