import type {
  DeleteArgs,
  DeleteManyArgs,
  InsertArgs,
  InsertManyArgs,
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

  async deleteAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.objectStore.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async insert(args: InsertArgs<TData>): Promise<TData> {
    return new Promise((resolve, reject) => {
      const request = this.objectStore.add(args.data)

      request.onsuccess = () => resolve(args.data)
      request.onerror = () => reject(request.error)
    })
  }

  async insertMany(args: InsertManyArgs<TData>): Promise<Array<TData>> {
    return await Promise.all(args.data.map((data) => this.insert({ data })))
  }
}
