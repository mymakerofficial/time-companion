import type {
  AdapterBaseQueryProps,
  AdapterDeleteProps,
  AdapterInsertManyProps,
  AdapterInsertProps,
  AdapterSelectProps,
  AdapterUpdateProps,
  DatabaseCursor,
  QueryableTableAdapter,
} from '@shared/database/types/adapter'
import { toArray } from '@shared/lib/utils/list'
import { isAbsent, isNotNull } from '@shared/lib/utils/checks'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'
import { filteredIterator } from '@shared/database/helpers/filteredIterator'
import { cursorIterator } from '@shared/database/helpers/cursorIterator'
import type { Nullable } from '@shared/lib/utils/types'
import type { OrderByDirection } from '@shared/database/types/database'
import { IndexedDBCursorImpl } from '@shared/database/adapters/indexedDB/helpers/cursor'

export class IdbQueryableTableAdapter<TData extends object>
  implements QueryableTableAdapter<TData>
{
  constructor(protected readonly objectStore: IDBObjectStore) {}

  protected async openIterator(
    props: Partial<AdapterBaseQueryProps>,
    predicate?: (value: TData) => boolean,
  ) {
    const indexes = toArray(this.objectStore.indexNames)

    const orderByColumn =
      isAbsent(props.orderByColumn) || !indexes.includes(props.orderByColumn)
        ? null
        : props.orderByColumn
    const oderByDirection = getOrDefault(props.oderByDirection, 'asc')

    const where = getOrNull(props.where)
    const limit = getOrDefault(props.limit, Infinity)
    const offset = getOrDefault(props.offset, 0)

    const cursor = await this.openCursor(orderByColumn, oderByDirection)
    return filteredIterator(
      cursorIterator(cursor),
      where,
      limit,
      offset,
      predicate,
    )
  }

  protected openCursor(
    indexName: Nullable<string>,
    direction: OrderByDirection,
  ): Promise<DatabaseCursor<TData>> {
    return new Promise((resolve, reject) => {
      const indexOrObjectStore = isNotNull(indexName)
        ? this.objectStore.index(indexName)
        : this.objectStore

      const cursorDirection = direction === 'desc' ? 'prev' : 'next'

      const request = indexOrObjectStore.openCursor(null, cursorDirection)

      request.onsuccess = () => {
        const cursor = new IndexedDBCursorImpl<TData>(
          request,
          this.objectStore.keyPath as keyof TData,
        )

        resolve(cursor)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

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