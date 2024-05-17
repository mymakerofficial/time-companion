import type {
  AdapterBaseQueryProps,
  DatabaseCursor,
} from '@shared/database/types/adapter'
import type { Nullable } from '@shared/lib/utils/types'
import { isAbsent, isNotNull } from '@shared/lib/utils/checks'
import { filteredIterator } from '@shared/database/helpers/filteredIterator'
import { cursorIterator } from '@shared/database/helpers/cursorIterator'
import { toArray } from '@shared/lib/utils/list'
import { IndexedDBCursorImpl } from '@shared/database/adapters/indexedDB/helpers/cursor'
import type { OrderByDirection } from '@shared/database/types/database'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'

export class IdbQueryable<TData extends object> {
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
}
