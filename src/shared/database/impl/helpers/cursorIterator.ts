import { isNull } from '@shared/lib/utils/checks'
import type { DatabaseCursor } from '@shared/database/adapter'

type DatabaseIteratedCursor<TData extends object> = Omit<
  DatabaseCursor<TData>,
  'close' | 'continue' | 'value'
> & {
  value: () => TData
}

export async function* cursorIterator<TData extends object>(
  cursor: DatabaseCursor<TData>,
): AsyncGenerator<DatabaseIteratedCursor<TData>> {
  while (true) {
    if (isNull(cursor.value())) {
      break
    }

    yield cursor as DatabaseIteratedCursor<TData>

    await cursor.continue()
  }
  cursor.close()
}
