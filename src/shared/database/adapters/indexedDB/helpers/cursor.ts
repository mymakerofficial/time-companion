import type { DatabaseCursor } from '@shared/database/types/adapter'
import type { Nullable } from '@shared/lib/utils/types'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { toArray } from '@shared/lib/utils/list'
import { keysOf } from '@shared/lib/utils/object'
import { getOrNull } from '@shared/lib/utils/result'

export class IndexedDBCursorImpl<TRow extends object>
  implements DatabaseCursor<TRow>
{
  protected _value: Nullable<TRow> = null

  constructor(
    protected readonly request: IDBRequest<IDBCursorWithValue | null>,
    protected readonly primaryKey: keyof TRow,
  ) {
    this._value = getOrNull(this.cursor?.value)
  }

  protected get cursor(): Nullable<IDBCursorWithValue> {
    return this.request.result as IDBCursorWithValue
  }

  value(): Nullable<TRow> {
    return this._value
  }

  update(data: Partial<TRow>): Promise<void> {
    return new Promise((resolve, reject) => {
      check(isNotNull(this.cursor), 'Cursor is not open.')
      const changedColumns = toArray(keysOf(data))

      check(
        !changedColumns.includes(this.primaryKey),
        `Primary key cannot be changed. Tried to change columns: ${changedColumns}.`,
      )

      const value = this.value()

      check(isNotNull(value), 'Cursor value is null.')

      const patched: TRow = {
        ...value,
        ...data,
      }

      const updateRequest = this.cursor.update(patched)

      updateRequest.onsuccess = () => {
        this._value = patched
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

      const deleteRequest = this.cursor.delete()

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
      this._value = null

      this.cursor?.continue()

      this.request.onsuccess = () => {
        if (isNotNull(this.cursor)) {
          this._value = this.cursor.value
        }
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
