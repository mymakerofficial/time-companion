import type {
  AdapterDeleteProps,
  AdapterInsertManyProps,
  AdapterInsertProps,
  AdapterSelectProps,
  AdapterUpdateProps,
  QueryableTableAdapter,
} from '@shared/database/types/adapter'
import { IdbQueryable } from '@shared/database/adapters/indexedDB/queryable'

export class IdbTableBaseAdapter<TData extends object>
  extends IdbQueryable<TData>
  implements QueryableTableAdapter<TData>
{
  async select(options: AdapterSelectProps<TData>): Promise<Array<TData>> {
    const iterator = await this.openIterator(options)

    const results = []
    for await (const cursor of iterator) {
      results.push(cursor.value())
    }

    return results
  }

  async update(options: AdapterUpdateProps<TData>): Promise<Array<TData>> {
    const iterator = await this.openIterator(options)

    const results = []
    for await (const cursor of iterator) {
      await cursor.update(options.data)
      results.push(cursor.value())
    }

    return results
  }

  async delete(options: AdapterDeleteProps<TData>): Promise<void> {
    const iterator = await this.openIterator(options)

    for await (const cursor of iterator) {
      await cursor.delete()
    }
  }

  deleteAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.objectStore.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  insert(options: AdapterInsertProps<TData>): Promise<TData> {
    return new Promise((resolve, reject) => {
      const request = this.objectStore.add(options.data)

      request.onsuccess = () => {
        resolve(options.data)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  async insertMany(
    options: AdapterInsertManyProps<TData>,
  ): Promise<Array<TData>> {
    const promises = options.data.map((data) => this.insert({ data }))
    return await Promise.all(promises)
  }
}
