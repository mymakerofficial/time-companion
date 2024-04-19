import type {
  DeleteArgs,
  DeleteManyArgs,
  FindArgs,
  FindManyArgs,
  InsertArgs,
  InsertManyArgs,
  Table,
  UpdateArgs,
  UpdateManyArgs,
} from '@shared/database/database'
import { emptyArray, firstOf } from '@shared/lib/utils/list'
import { filteredCursorIterator } from '@shared/database/adapters/indexedDb/helpers/filteredCursorIterator'
import { IDBAdapterQueryable } from '@shared/database/adapters/indexedDb/queryable'

export class IDBAdapterTable<TData extends object>
  extends IDBAdapterQueryable<TData>
  implements Table<TData>
{
  async update(args: UpdateArgs<TData>): Promise<TData> {
    return firstOf(
      await this.updateMany({
        ...args,
        limit: 1,
      }),
    )
  }

  async updateMany(args: UpdateManyArgs<TData>): Promise<Array<TData>> {
    const iterable = filteredCursorIterator(this.objectStore, args)

    const list: Array<TData> = emptyArray()

    for await (const cursor of iterable) {
      const patched = {
        ...cursor.value,
        ...args.data,
      }

      cursor.update(patched)
      list.push(patched)
    }

    return list
  }

  async delete(args: DeleteArgs<TData>): Promise<void> {
    await this.deleteMany({
      ...args,
      limit: 1,
    })
  }

  async deleteMany(args: DeleteManyArgs<TData>): Promise<void> {
    const iterable = filteredCursorIterator(this.objectStore, args)

    for await (const cursor of iterable) {
      cursor.delete()
    }
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
