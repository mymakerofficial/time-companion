import { isNull } from '@shared/lib/utils/checks'
import type {
  DatabaseCursor,
  DatabaseCursorWithValue,
  DatabaseIterator,
} from '@database/types/cursor'

export async function* cursorIterator<TRow extends object>(
  cursor: DatabaseCursor<TRow>,
): DatabaseIterator<TRow> {
  try {
    while (true) {
      if (isNull(cursor.value)) {
        break
      }

      yield cursor as DatabaseCursorWithValue<TRow>

      await cursor.continue()
    }
  } finally {
    cursor.close()
  }
}
