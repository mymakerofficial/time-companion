import type {
  CreateTableArgs,
  UpgradeTransaction,
} from '@shared/database/database'

export class IndexedDbFacadeUpgradeTransaction implements UpgradeTransaction {
  constructor(
    private readonly database: IDBDatabase,
    private readonly event: IDBVersionChangeEvent,
  ) {}

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
