import type { FindManyArgs } from '@shared/database/types/database'
import { cursorIterator } from '@shared/database/adapters/indexedDB/helpers/cursorIterator'
import { check, isNotNull, isNull } from '@shared/lib/utils/checks'
import { maybeUnwrapOrderBy } from '@shared/database/helpers/unwrapOrderBy'
import { wherePredicate } from '@shared/database/helpers/wherePredicate'
import type { Nullable } from '@shared/lib/utils/types'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'

export async function* filteredCursorIterator<TData extends object>(
  objectStore: IDBObjectStore,
  args?: FindManyArgs<TData>,
  // an optional predicate to filter the results
  predicate?: (value: TData) => boolean,
) {
  const matches = wherePredicate(args?.where)

  const unwrappedOrderBy = getOrDefault(maybeUnwrapOrderBy(args?.orderBy), {
    key: null,
    direction: 'asc',
  })

  const orderBy = unwrappedOrderBy.key as Nullable<string>
  const direction = unwrappedOrderBy.direction === 'asc' ? 'next' : 'prev'

  const limit = getOrNull(args?.limit)
  const offset = getOrDefault(args?.offset, 0)

  check(
    isNull(orderBy) || objectStore.indexNames.contains(orderBy),
    `The index "${orderBy}" does not exist. You can only order by existing indexes or primary key.`,
  )

  const orderIsIndexed =
    isNotNull(orderBy) && objectStore.indexNames.contains(orderBy)

  const indexOrObjectStore = orderIsIndexed
    ? objectStore.index(orderBy)
    : objectStore

  const iterator = cursorIterator(indexOrObjectStore, null, direction)

  let count = 0
  for await (const cursor of iterator) {
    if (count < offset) {
      count++
      continue
    }

    if (isNotNull(limit) && count >= limit + offset) {
      continue
    }

    if (predicate && !predicate(cursor.value)) {
      continue
    }

    if (!matches(cursor.value)) {
      continue
    }

    yield cursor

    count++
  }
}
