import { isNull } from '@shared/lib/utils/checks'
import type { InMemoryCursor } from '@shared/database/adapters/inMemory/helpers/cursor'

type InMemoryCursorIterator<TData extends object> = Omit<
  InMemoryCursor<TData>,
  'close' | 'continue' | 'value'
> & {
  value: () => TData
}

export function* cursorIterator<TData extends object>(
  cursor: InMemoryCursor<TData>,
): Generator<InMemoryCursorIterator<TData>> {
  while (true) {
    if (isNull(cursor.value())) {
      break
    }

    yield cursor as InMemoryCursorIterator<TData>

    cursor.continue()
  }
  cursor.close()
}
