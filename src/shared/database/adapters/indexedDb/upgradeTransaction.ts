import type {
  CreateTableArgs,
  UpgradeTransaction,
} from '@shared/database/database'

export class IDBAdapterUpgradeTransaction implements UpgradeTransaction {
  constructor(
    private readonly database: IDBDatabase,
    private readonly event: IDBVersionChangeEvent,
  ) {}

  createTable(args: CreateTableArgs): Promise<void> {
    return new Promise((resolve, reject) => {
      this.database.createObjectStore(args.name, {
        keyPath: args.primaryKey,
        autoIncrement: false,
      })

      // the object store is created synchronously, so we can resolve immediately
      resolve()
    })
  }
}
