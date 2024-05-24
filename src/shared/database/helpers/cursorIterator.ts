import { isNull } from '@shared/lib/utils/checks'
import type { DatabaseCursor } from '@shared/database/types/adapter'

export type DatabaseIteratedCursor<TRow extends object> = Omit<
  DatabaseCursor<TRow>,
  'continue' | 'value'
> & {
  value: () => TRow
}

export async function* cursorIterator<TRow extends object>(
  cursor: DatabaseCursor<TRow>,
): AsyncGenerator<DatabaseIteratedCursor<TRow>> {
  try {
    while (true) {
      if (isNull(cursor.value())) {
        break
      }

      yield cursor as DatabaseIteratedCursor<TRow>

      await cursor.continue()
    }
  } finally {
    cursor.close()
  }
}
