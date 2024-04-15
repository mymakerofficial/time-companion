import type { Nullable } from '@shared/lib/utils/types'
import type {
  CreateTableArgs,
  Database,
  Transaction,
  UpgradeTransaction,
} from '@shared/database/database'
import { IndexedDbFacadeTransaction } from '@renderer/database/indexedDb/transaction'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { IndexedDbFacadeUpgradeTransaction } from '@renderer/database/indexedDb/upgradeTransaction'

export class IndexedDbFacade implements Database {
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
        await upgrade(
          new IndexedDbFacadeUpgradeTransaction(request.result, event),
        )
        resolve()
      }
    })
  }

  async createTransaction<TResult>(
    fn: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    check(isNotNull(this.database), 'Database is not open.')

    return await fn(new IndexedDbFacadeTransaction(this.database))
  }
}

export function createIndexedDbFacade(): Database {
  return new IndexedDbFacade()
}
