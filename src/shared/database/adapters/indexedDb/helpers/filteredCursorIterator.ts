import type { FindManyArgs } from '@shared/database/database'
import { cursorIterator } from '@shared/database/adapters/indexedDb/helpers/cursorIterator'
import { isNotNull } from '@shared/lib/utils/checks'
import { maybeUnwrapWhere } from '@shared/database/helpers/unwrapWhere'
import { maybeUnwrapOrderBy } from '@shared/database/helpers/unwrapOrderBy'
import { unwrappedWherePredicate } from '@shared/database/helpers/wherePredicate'
import type { Nullable } from '@shared/lib/utils/types'
import { todo } from '@shared/lib/utils/todo'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'

export async function* filteredCursorIterator<TData extends object>(
  objectStore: IDBObjectStore,
  args?: FindManyArgs<TData>,
) {
  const unwrappedWhere = maybeUnwrapWhere(args?.where)

  const unwrappedOrderBy = getOrDefault(maybeUnwrapOrderBy(args?.orderBy), {
    key: null,
    direction: 'asc',
  })

  const orderBy = unwrappedOrderBy.key as Nullable<string>
  const direction = unwrappedOrderBy.direction === 'asc' ? 'next' : 'prev'

  const limit = getOrNull(args?.limit)
  const offset = getOrNull(args?.offset)

  const orderByIsIndexed =
    isNotNull(orderBy) && objectStore.indexNames.contains(orderBy)

  if (isNotNull(orderBy) && !orderByIsIndexed) {
    todo()
  }

  const indexOrObjectStore = orderByIsIndexed
    ? objectStore.index(orderBy)
    : objectStore

  const iterator = cursorIterator(indexOrObjectStore, null, direction)

  let count = 0
  for await (const cursor of iterator) {
    const matches = unwrappedWherePredicate(unwrappedWhere)(cursor.value)

    if (isNotNull(limit) && count > limit) {
      continue
    }

    if (!matches) {
      continue
    }

    yield cursor

    count++
  }
}
