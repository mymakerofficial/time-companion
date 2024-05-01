import type {
  DatabaseCursor,
  DatabaseCursorDirection,
  DatabaseTableAdapter,
} from '@shared/database/types/adapter'
import type { Nullable } from '@shared/lib/utils/types'
import { toArray } from '@shared/lib/utils/list'
import { IndexedDBCursorImpl } from '@shared/database/adapters/indexedDB/helpers/cursor'
import { isNotNull } from '@shared/lib/utils/checks'

export class IndexedDBDatabaseTableAdapterImpl<TData extends object>
  implements DatabaseTableAdapter<TData>
{
  constructor(protected readonly objectStore: IDBObjectStore) {}

  insert(data: TData): Promise<void> {
    return new Promise((resolve) => {
      this.objectStore.add(data)
      resolve()
    })
  }

  deleteAll(): Promise<void> {
    return new Promise((resolve) => {
      this.objectStore.clear()
      resolve()
    })
  }

  openCursor(
    indexName: Nullable<string>,
    direction: DatabaseCursorDirection,
  ): Promise<DatabaseCursor<TData>> {
    return new Promise((resolve, reject) => {
      const indexOrObjectStore = isNotNull(indexName)
        ? this.objectStore.index(indexName)
        : this.objectStore

      const request = indexOrObjectStore.openCursor(null, direction)

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

  createIndex(keyPath: string, unique: boolean): Promise<void> {
    return new Promise((resolve) => {
      this.objectStore.createIndex(keyPath, keyPath, { unique })
      resolve()
    })
  }

  getIndexNames(): Promise<Array<string>> {
    return new Promise((resolve) => {
      resolve(toArray(this.objectStore.indexNames))
    })
  }
}
