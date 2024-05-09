import type { DatabaseIteratedCursor } from '@shared/database/factory/helpers/cursorIterator'
import { wherePredicate } from '@shared/database/helpers/wherePredicate'
import type { RawWhere } from '@shared/database/types/schema'

export async function* filteredIterator<TData extends object>(
  iterator: AsyncGenerator<DatabaseIteratedCursor<TData>>,
  where: RawWhere<unknown>,
  limit: number = Infinity,
  offset: number = 0,
  predicate?: (value: TData) => boolean,
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
