import { wherePredicate } from '@shared/database/helpers/wherePredicate'
import type { RawWhere } from '@shared/database/types/schema'
import type { Nullable } from '@shared/lib/utils/types'
import type { DatabaseIterator } from '@shared/database/types/cursor'

export async function* filteredIterator<TRow extends object>(
  iterator: DatabaseIterator<TRow>,
  where: Nullable<RawWhere>,
  limit: number = Infinity,
  offset: number = 0,
) {
  const matches = wherePredicate(where)

  let count = 0
  for await (const cursor of iterator) {
    if (count >= limit + offset) {
      break
    }

    if (!matches(cursor.value)) {
      continue
    }

    // check the offset **after** filtering
    if (count < offset) {
      count++
      continue
    }

    yield cursor

    count++
  }
}
