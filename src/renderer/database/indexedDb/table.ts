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
import { IndexedDbFacadeQueryable } from '@renderer/database/indexedDb/queryable'

export class IndexedDbFacadeTable<TData extends object>
  extends IndexedDbFacadeQueryable<TData>
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
