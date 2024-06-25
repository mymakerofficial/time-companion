import type { Nullable } from '@shared/lib/utils/types'
import type { OrderByDirection } from '@database/types/database'
import type { DatabaseCursor } from '@database/types/cursor'
import { isNotNull } from '@shared/lib/utils/checks'
import { directionToIdbCursorDirection } from '@database/adapters/indexedDB/helpers/directionToIdbCursorDirection'
import { IndexedDBCursorImpl } from '@database/adapters/indexedDB/helpers/cursor'

export function openCursor<TRow extends object>(
  objectStore: IDBObjectStore,
  indexName: Nullable<string> = null,
  direction: OrderByDirection = 'asc',
  keyRange: Nullable<IDBKeyRange> = null,
): Promise<DatabaseCursor<TRow>> {
  return new Promise((resolve, reject) => {
    const indexOrObjectStore = isNotNull(indexName)
      ? objectStore.index(indexName)
      : objectStore

    const cursorDirection = directionToIdbCursorDirection(direction)

    const request = indexOrObjectStore.openCursor(keyRange, cursorDirection)

    request.onsuccess = () => {
      const cursor = new IndexedDBCursorImpl<TRow>(
        request,
        objectStore.keyPath as keyof TRow,
      )

      resolve(cursor)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}
