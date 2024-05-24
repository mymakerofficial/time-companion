import type { DatabaseIteratedCursor } from '@shared/database/helpers/cursorIterator'
import { wherePredicate } from '@shared/database/helpers/wherePredicate'
import type { RawWhere } from '@shared/database/types/schema'
import type { Nullable } from '@shared/lib/utils/types'

export async function* filteredIterator<TRow extends object>(
  iterator: AsyncGenerator<DatabaseIteratedCursor<TRow>>,
  where: Nullable<RawWhere>,
  limit: number = Infinity,
  offset: number = 0,
  predicate?: (value: TRow) => boolean,
) {
  const matches = wherePredicate(where)

  let count = 0
  for await (const cursor of iterator) {
    if (count < offset) {
      count++
      continue
    }

    if (count >= limit + offset) {
      break
    }

    if (predicate && !predicate(cursor.value())) {
      continue
    }

    if (!matches(cursor.value())) {
      continue
    }

    yield cursor

    count++
  }
}
