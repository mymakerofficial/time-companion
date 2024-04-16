import type { CreateIndexArgs, UpgradeTable } from '@shared/database/database'

export class IDBAdapterUpgradeTable<TData extends object>
  implements UpgradeTable<TData>
{
  constructor(private readonly store: IDBObjectStore) {}

  async createIndex(args: CreateIndexArgs<TData>): Promise<void> {
    return new Promise((resolve) => {
      this.store.createIndex(args.keyPath as string, args.keyPath as string, {
        unique: args.unique,
      })

      resolve()
    })
  }
}
