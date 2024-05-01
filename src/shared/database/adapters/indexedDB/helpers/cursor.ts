import type { DatabaseCursor } from '@shared/database/types/adapter'
import type { Nullable } from '@shared/lib/utils/types'
import { check, isNotNull, isNull } from '@shared/lib/utils/checks'
import { asSet, toArray } from '@shared/lib/utils/list'
import { keysOf } from '@shared/lib/utils/object'

export class IndexedDBCursorImpl<TData extends object>
  implements DatabaseCursor<TData>
{
  constructor(
    protected readonly request: IDBRequest<IDBCursorWithValue | null>,
    protected readonly primaryKey: keyof TData,
  ) {}

  protected get cursor(): Nullable<IDBCursorWithValue> {
    return this.request.result as IDBCursorWithValue
  }

  value(): Nullable<TData> {
    if (isNull(this.cursor)) {
      return null
    }

    return this.cursor.value as TData
  }

  update(data: Partial<TData>): Promise<void> {
    return new Promise((resolve, reject) => {
      check(isNotNull(this.cursor), 'Cursor is not open.')
      const changedColumns = toArray(keysOf(data))

      check(
        !changedColumns.includes(this.primaryKey),
        `Primary key cannot be changed. Tried to change columns: ${changedColumns}.`,
      )

      const value = this.value()

      const patched = {
        ...value,
        ...data,
      }

      const updateRequest = this.cursor.update(patched)

      updateRequest.onsuccess = () => {
        resolve()
      }

      updateRequest.onerror = () => {
        reject(updateRequest.error)
      }
    })
  }

  delete(): Promise<void> {
    return new Promise((resolve, reject) => {
      check(isNotNull(this.cursor), 'Cursor is not open.')

      const deleteRequest = this.cursor!.delete()

      deleteRequest.onsuccess = () => {
        resolve()
      }

      deleteRequest.onerror = () => {
        reject(deleteRequest.error)
      }
    })
  }

  continue(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cursor?.continue()

      this.request.onsuccess = () => {
        resolve()
      }

      this.request.onerror = () => {
        reject(this.request!.error)
      }
    })
  }

  close(): void {
    // do nothing
  }
}
