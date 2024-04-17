import type {
  CreateTableArgs,
  Join,
  Table,
  UpgradeTable,
  UpgradeTransaction,
} from '@shared/database/database'
import { IDBAdapterUpgradeTable } from '@shared/database/adapters/indexedDb/upgradeTable'
import { check } from '@shared/lib/utils/checks'
import { IDBAdapterTable } from '@shared/database/adapters/indexedDb/table'
import { todo } from '@shared/lib/utils/todo'
import { toArray } from '@shared/lib/utils/list'

export class IDBAdapterUpgradeTransaction implements UpgradeTransaction {
  protected readonly transaction: IDBTransaction

  constructor(
    protected readonly database: IDBDatabase,
    protected readonly event: IDBVersionChangeEvent,
  ) {
    // get the current transaction... i don't think this is even documented anywhere
    // thanks https://stackoverflow.com/a/21078740

    // @ts-expect-error
    this.transaction = this.event.target.transaction
  }

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

  table<TData extends object>(tableName: string): Table<TData> {
    const objectStoreNames = toArray(this.database.objectStoreNames)

    check(
      objectStoreNames.includes(tableName),
      `Table "${tableName}" does not exist.`,
    )

    // use the active transaction because we cant create one while the version change transaction is active
    const objectStore = this.transaction.objectStore(tableName)

    return new IDBAdapterTable<TData>(objectStore)
  }

  join<TLeftData extends object, TRightData extends object>(
    leftTable: string,
    rightTable: string,
  ): Join<TLeftData, TRightData> {
    todo()
  }
}
