import type { DatabaseCursor } from '@/shared/database/types/cursor'
import type { Nullable } from '@shared/lib/utils/types'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { getOrNull } from '@shared/lib/utils/result'
import { promisedRequest } from '@shared/database/adapters/indexedDB/helpers/promisedRequest'

export class IndexedDBCursorImpl<TRow extends object>
  implements DatabaseCursor<TRow>
{
  protected _value: Nullable<TRow> = null

  constructor(
    protected readonly request: IDBRequest<Nullable<IDBCursorWithValue>>,
    protected readonly primaryKey: keyof TRow,
  ) {
    this._value = getOrNull(this.cursor?.value)
  }

  protected get cursor(): Nullable<IDBCursorWithValue> {
    return this.request.result as IDBCursorWithValue
  }

  get value(): Nullable<TRow> {
    return this._value
  }

  async update(data: TRow): Promise<void> {
    check(isNotNull(this.cursor), 'Cursor is not open.')
    await promisedRequest(this.cursor.update(data))
  }

  delete(): Promise<void> {
    check(isNotNull(this.cursor), 'Cursor is not open.')
    return promisedRequest(this.cursor.delete())
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
