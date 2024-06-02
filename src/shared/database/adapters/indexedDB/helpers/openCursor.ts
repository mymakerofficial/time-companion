import type { Nullable } from '@shared/lib/utils/types'
import type {
  KeyRange,
  OrderByDirection,
} from '@shared/database/types/database'
import type { DatabaseCursor } from '@shared/database/types/cursor'
import { isNotNull } from '@shared/lib/utils/checks'
import { directionToIdbCursorDirection } from '@shared/database/adapters/indexedDB/helpers/directionToIdbCursorDirection'
import { IndexedDBCursorImpl } from '@shared/database/adapters/indexedDB/helpers/cursor'

export function openCursor<TRow extends object>(
  objectStore: IDBObjectStore,
  indexName: Nullable<string> = null,
  direction: OrderByDirection = 'asc',
  keyRange: Nullable<KeyRange> = null,
): Promise<DatabaseCursor<TRow>> {
  return new Promise((resolve, reject) => {
    const indexOrObjectStore = isNotNull(indexName)
      ? objectStore.index(indexName)
      : objectStore

    const range = isNotNull(keyRange)
      ? IDBKeyRange.bound(
          // turn the key range into a key range... but different
          keyRange.lower,
          keyRange.upper,
          keyRange.lowerOpen,
          keyRange.upperOpen,
        )
      : null

    const cursorDirection = directionToIdbCursorDirection(direction)

    const request = indexOrObjectStore.openCursor(range, cursorDirection)

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
