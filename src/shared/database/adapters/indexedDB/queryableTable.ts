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
import { check, isAbsent, isNotNull } from '@shared/lib/utils/checks'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'
import { filteredIterator } from '@shared/database/helpers/filteredIterator'
import { cursorIterator } from '@shared/database/helpers/cursorIterator'
import type { Nullable } from '@shared/lib/utils/types'
import type {
  KeyRange,
  OrderByDirection,
} from '@shared/database/types/database'
import { IndexedDBCursorImpl } from '@shared/database/adapters/indexedDB/helpers/cursor'
import { IDBKeyRange } from 'fake-indexeddb'

export class IdbQueryableTableAdapter<TRow extends object>
  implements QueryableTableAdapter<TRow>
{
  constructor(protected readonly objectStore: IDBObjectStore) {}

  protected async openIterator(
    props: Partial<AdapterBaseQueryProps>,
    predicate?: (value: TRow) => boolean,
  ) {
    const indexes = toArray(this.objectStore.indexNames)
    const primaryKey = this.objectStore.keyPath

    check(
      isAbsent(props.orderBy) ||
        props.orderBy.column.columnName === primaryKey ||
        indexes.includes(props.orderBy.column.columnName!),
      `Failed to order by column "${props.orderBy?.column.columnName}". Column must either be indexed or the primary key.`,
    )

    check(
      isAbsent(props.range) ||
        props.range.column.columnName === primaryKey ||
        indexes.includes(props.range.column.columnName!),
      `Failed to apply range from column "${props.orderBy?.column.columnName}". Column must either be indexed or the primary key.`,
    )

    const byColumn = getOrNull(
      props.orderBy?.column.columnName ?? props.range?.column.columnName,
    )

    const direction = getOrDefault(props.orderBy?.direction, 'asc')

    const where = getOrNull(props.where)
    const range = getOrNull(props.range)
    const limit = getOrDefault(props.limit, Infinity)
    const offset = getOrDefault(props.offset, 0)

    const cursor = await this.openCursor(
      byColumn === primaryKey ? null : byColumn,
      direction,
      range,
    )
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
    keyRange: Nullable<KeyRange>,
  ): Promise<DatabaseCursor<TRow>> {
    return new Promise((resolve, reject) => {
      const indexOrObjectStore = isNotNull(indexName)
        ? this.objectStore.index(indexName)
        : this.objectStore

      const cursorDirection = direction === 'desc' ? 'prev' : 'next'

      this.objectStore.openKeyCursor()

      const query = isNotNull(keyRange)
        ? IDBKeyRange.bound(
            keyRange.lower,
            keyRange.upper,
            keyRange.lowerOpen,
            keyRange.upperOpen,
          )
        : null

      const request = indexOrObjectStore.openCursor(query, cursorDirection)

      request.onsuccess = () => {
        const cursor = new IndexedDBCursorImpl<TRow>(
          request,
          this.objectStore.keyPath as keyof TRow,
        )

        resolve(cursor)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  async select(props: AdapterSelectProps<TRow>): Promise<Array<TRow>> {
    const iterator = await this.openIterator(props)

    const results = []
    for await (const cursor of iterator) {
      results.push(cursor.value())
    }

    return results
  }

  async update(props: AdapterUpdateProps<TRow>): Promise<Array<TRow>> {
    const iterator = await this.openIterator(props)

    const results = []
    for await (const cursor of iterator) {
      await cursor.update(props.data)
      results.push(cursor.value())
    }

    return results
  }

  async delete(props: AdapterDeleteProps<TRow>): Promise<void> {
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

  insert(props: AdapterInsertProps<TRow>): Promise<TRow> {
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

  async insertMany(props: AdapterInsertManyProps<TRow>): Promise<Array<TRow>> {
    const promises = props.data.map((data) => this.insert({ data }))
    return await Promise.all(promises)
  }
}
