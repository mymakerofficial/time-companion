import type { FindManyArgs } from '@shared/database/database'
import { cursorIterator } from '@shared/database/adapters/indexedDb/helpers/cursorIterator'
import { isNotNull } from '@shared/lib/utils/checks'
import { maybeUnwrapWhere } from '@shared/database/helpers/unwrapWhere'
import { maybeUnwrapOrderBy } from '@shared/database/helpers/unwrapOrderBy'
import {
  unwrappedWherePredicate,
  wherePredicate,
} from '@shared/database/helpers/wherePredicate'
import type { Nullable } from '@shared/lib/utils/types'
import { todo } from '@shared/lib/utils/todo'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'

export async function* filteredCursorIterator<TData extends object>(
  objectStore: IDBObjectStore,
  args?: FindManyArgs<TData>,
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

    if (!matches(cursor.value)) {
      continue
    }

    yield cursor

    count++
  }
}
