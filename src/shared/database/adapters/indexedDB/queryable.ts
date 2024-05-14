import type {
  AdapterSelectProps,
  DatabaseCursor,
} from '@shared/database/types/adapter'
import type { Nullable } from '@shared/lib/utils/types'
import { check, isNotNull, isNull } from '@shared/lib/utils/checks'
import { filteredIterator } from '@shared/database/helpers/filteredIterator'
import { cursorIterator } from '@shared/database/helpers/cursorIterator'
import { toArray } from '@shared/lib/utils/list'
import { IndexedDBCursorImpl } from '@shared/database/adapters/indexedDB/helpers/cursor'
import type { OrderByDirection } from '@shared/database/types/database'

export class IdbQueryable<TData extends object> {
  constructor(protected readonly objectStore: IDBObjectStore) {}

  protected async openIterator(
    {
      orderByColumn,
      oderByDirection,
      limit,
      offset,
      where,
    }: AdapterSelectProps<TData>,
    predicate?: (value: TData) => boolean,
  ) {
    const indexes = toArray(this.objectStore.indexNames)

    check(
      isNull(orderByColumn) || indexes.includes(orderByColumn),
      `The index "${orderByColumn}" does not exist. You can only order by existing indexes or primary key.`,
    )

    const cursor = await this.openCursor(orderByColumn, oderByDirection)
    return filteredIterator(
      cursorIterator(cursor),
      where,
      limit ?? Infinity,
      offset ?? 0,
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
}
