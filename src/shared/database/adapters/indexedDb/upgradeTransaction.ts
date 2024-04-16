import type {
  CreateTableArgs,
  UpgradeTable,
  UpgradeTransaction,
} from '@shared/database/database'
import { IDBAdapterUpgradeTable } from '@shared/database/adapters/indexedDb/upgradeTable'

export class IDBAdapterUpgradeTransaction implements UpgradeTransaction {
  constructor(
    private readonly database: IDBDatabase,
    private readonly event: IDBVersionChangeEvent,
  ) {}

  createTable<TData extends object>(
    args: CreateTableArgs<TData>,
  ): Promise<UpgradeTable<TData>> {
    return new Promise((resolve) => {
      const store = this.database.createObjectStore(args.name, {
        keyPath: args.primaryKey as string,
        autoIncrement: false,
      })

      // the object store is created synchronously, so we can resolve immediately
      resolve(new IDBAdapterUpgradeTable(store))
    })
  }
}
