import type {
  CreateIndexArgs,
  UpgradeTable,
} from '@shared/database/types/database'
import { IDBAdapterTable } from '@shared/database/adapters/indexedDB/table'

export class IDBAdapterUpgradeTable<TData extends object>
  extends IDBAdapterTable<TData>
  implements UpgradeTable<TData>
{
  async createIndex(args: CreateIndexArgs<TData>): Promise<void> {
    return new Promise((resolve) => {
      this.objectStore.createIndex(
        args.keyPath as string,
        args.keyPath as string,
        {
          unique: args.unique,
        },
      )

      resolve()
    })
  }
}
