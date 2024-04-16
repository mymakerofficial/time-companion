import type {
  CreateTableArgs,
  UpgradeTransaction,
} from '@shared/database/database'
import { IndexedDbFacadeBase } from '@shared/database/adapters/indexedDb/base'

export class IndexedDbFacadeUpgradeTransaction
  extends IndexedDbFacadeBase
  implements UpgradeTransaction
{
  constructor(
    database: IDBDatabase,
    private readonly event: IDBVersionChangeEvent,
  ) {
    super(database)
  }

  createTable(args: CreateTableArgs): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.database.createObjectStore(args.name, {
        keyPath: args.primaryKey,
        autoIncrement: false,
      })

      store.transaction.oncomplete = () => resolve()
      store.transaction.onerror = () => reject(store.transaction.error)
    })
  }
}
