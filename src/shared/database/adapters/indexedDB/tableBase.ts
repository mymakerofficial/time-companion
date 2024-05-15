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
  async select(props: AdapterSelectProps<TData>): Promise<Array<TData>> {
    const iterator = await this.openIterator(props)

    const results = []
    for await (const cursor of iterator) {
      results.push(cursor.value())
    }

    return results
  }

  async update(props: AdapterUpdateProps<TData>): Promise<Array<TData>> {
    const iterator = await this.openIterator(props)

    const results = []
    for await (const cursor of iterator) {
      await cursor.update(props.data)
      results.push(cursor.value())
    }

    return results
  }

  async delete(props: AdapterDeleteProps<TData>): Promise<void> {
    const iterator = await this.openIterator(props)

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

  insert(props: AdapterInsertProps<TData>): Promise<TData> {
    return new Promise((resolve, reject) => {
      const request = this.objectStore.add(props.data)

      request.onsuccess = () => {
        resolve(props.data)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  async insertMany(
    props: AdapterInsertManyProps<TData>,
  ): Promise<Array<TData>> {
    const promises = props.data.map((data) => this.insert({ data }))
    return await Promise.all(promises)
  }
}
