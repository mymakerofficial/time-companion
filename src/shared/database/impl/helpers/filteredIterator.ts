import type { DatabaseIteratedCursor } from '@shared/database/impl/helpers/cursorIterator'
import type { FindManyArgs } from '@shared/database/database'
import { getOrDefault } from '@shared/lib/utils/result'
import { wherePredicate } from '@shared/database/helpers/wherePredicate'

export async function* filteredIterator<TData extends object>(
  iterator: AsyncGenerator<DatabaseIteratedCursor<TData>>,
  args?: FindManyArgs<TData>,
  predicate?: (value: TData) => boolean,
) {
  const limit = getOrDefault(args?.limit, Infinity)
  const offset = getOrDefault(args?.offset, 0)

  const matches = wherePredicate(args?.where)

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
