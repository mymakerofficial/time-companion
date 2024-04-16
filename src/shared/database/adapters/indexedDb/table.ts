import type {
  CreateArgs,
  CreateManyArgs,
  DeleteArgs,
  DeleteManyArgs,
  Table,
  UpdateArgs,
  UpdateManyArgs,
} from '@shared/database/database'
import { todo } from '@shared/lib/utils/todo'
import { IDBAdapterQueryable } from '@shared/database/adapters/indexedDb/queryable'

export class IDBAdapterTable<TData extends object>
  extends IDBAdapterQueryable<TData>
  implements Table<TData>
{
  constructor(objectStore: IDBObjectStore) {
    super(objectStore)
  }

  async update(args: UpdateArgs<TData>): Promise<TData> {
    todo()
  }

  async updateMany(args: UpdateManyArgs<TData>): Promise<Array<TData>> {
    todo()
  }

  async delete(args: DeleteArgs<TData>): Promise<void> {
    todo()
  }

  async deleteMany(args: DeleteManyArgs<TData>): Promise<void> {
    todo()
  }

  async create(args: CreateArgs<TData>): Promise<TData> {
    return new Promise((resolve, reject) => {
      const request = this.objectStore.add(args.data)

      request.onsuccess = () => resolve(args.data)
      request.onerror = () => reject(request.error)
    })
  }

  async createMany(args: CreateManyArgs<TData>): Promise<Array<TData>> {
    todo()
  }
}
