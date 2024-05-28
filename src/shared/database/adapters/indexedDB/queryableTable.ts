import type {
  AdapterBaseQueryProps,
  AdapterDeleteProps,
  AdapterInsertManyProps,
  AdapterInsertProps,
  AdapterSelectProps,
  AdapterUpdateProps,
  QueryableTableAdapter,
} from '@shared/database/types/adapter'
import type { DatabaseCursor } from '../../types/cursor'
import { toArray } from '@shared/lib/utils/list'
import { isNotNull, isNull } from '@shared/lib/utils/checks'
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
import { directionToIdbCursorDirection } from '@shared/database/adapters/indexedDB/helpers/directionToIdbCursorDirection'
import {
  iteratorToList,
  iteratorToSortedList,
} from '@shared/database/helpers/iteratorToList'

export class IdbQueryableTableAdapter<TRow extends object>
  implements QueryableTableAdapter<TRow>
{
  constructor(protected readonly objectStore: IDBObjectStore) {}

  protected async openIterator(props: Partial<AdapterBaseQueryProps>) {
    const indexes = toArray(this.objectStore.indexNames)

    const byColumn = getOrNull(
      props.orderBy?.column.columnName ?? props.range?.column.columnName,
    )

    const isNotIndexed = isNull(byColumn) || !indexes.includes(byColumn)

    const indexName = isNotIndexed ? null : byColumn

    const direction = getOrDefault(props.orderBy?.direction, 'asc')

    const where = getOrNull(props.where)
    const range = getOrNull(props.range)
    const limit = getOrDefault(props.limit, Infinity)
    const offset = getOrDefault(props.offset, 0)

    const cursor = await this.openCursor(indexName, direction, range)

    return {
      iterator: filteredIterator(cursorIterator(cursor), where, limit, offset),
      byColumn: byColumn as Nullable<keyof TRow>,
      direction,
      isNotIndexed,
    }
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

      const query = isNotNull(keyRange)
        ? IDBKeyRange.bound(
            keyRange.lower,
            keyRange.upper,
            keyRange.lowerOpen,
            keyRange.upperOpen,
          )
        : null

      const cursorDirection = directionToIdbCursorDirection(direction)

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
    const { iterator, isNotIndexed, byColumn, direction } =
      await this.openIterator(props)

    if (isNotIndexed && isNotNull(byColumn)) {
      const compareFn =
        direction === 'asc'
          ? (a: TRow, b: TRow) => (a[byColumn] > b[byColumn] ? 1 : -1)
          : (a: TRow, b: TRow) => (a[byColumn] < b[byColumn] ? 1 : -1)

      return await iteratorToSortedList(iterator, compareFn)
    } else {
      return await iteratorToList(iterator)
    }
  }

  async update(props: AdapterUpdateProps<TRow>): Promise<Array<TRow>> {
    const { iterator } = await this.openIterator(props)

    const results = []
    for await (const cursor of iterator) {
      await cursor.update(props.data)
      results.push(cursor.value)
    }

    return results
  }

  async delete(props: AdapterDeleteProps<TRow>): Promise<void> {
    const { iterator } = await this.openIterator(props)

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
