import type { Nullable } from '@shared/lib/utils/types'
import { isNull } from '@shared/lib/utils/checks'

export async function* cursorIterator(
  objectStore: IDBObjectStore | IDBIndex,
  query?: IDBValidKey | IDBKeyRange | null,
  direction?: IDBCursorDirection,
) {
  const request = objectStore.openCursor(query, direction)

  while (true) {
    const cursor: Nullable<IDBCursorWithValue> = await new Promise(
      (resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      },
    )

    if (isNull(cursor)) {
      break
    }

    yield cursor

    cursor.continue()
  }
}
