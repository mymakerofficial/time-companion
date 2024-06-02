import type { AdapterBaseQueryProps } from '@shared/database/types/adapter'
import { toArray } from '@shared/lib/utils/list'
import { check, isNotNull, isNull, isUndefined } from '@shared/lib/utils/checks'
import { DatabaseInvalidRangeColumnError } from '@shared/database/types/errors'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'
import { filteredIterator } from '@shared/database/helpers/filteredIterator'
import { cursorIterator } from '@shared/database/helpers/cursorIterator'
import type { Nullable } from '@shared/lib/utils/types'
import { openCursor } from '@shared/database/adapters/indexedDB/helpers/openCursor'

export async function openIterator<TRow extends object>(
  objectStore: IDBObjectStore,
  props: Partial<AdapterBaseQueryProps>,
) {
  const indexes = toArray(objectStore.indexNames)
  const primaryKey = objectStore.keyPath

  // if the range or orderBy column is the primary key, make it null
  //  we use null to indicate that we should not use an index
  //  but use the object store itself

  // undefined means there is actually no value

  const rangeColumn =
    props.range?.column.columnName !== primaryKey
      ? props.range?.column.columnName
      : null
  const orderByColumn =
    props.orderBy?.column.columnName !== primaryKey
      ? props.orderBy?.column.columnName
      : null

  check(
    isNull(rangeColumn) ||
      isUndefined(rangeColumn) ||
      indexes.includes(rangeColumn),
    () => new DatabaseInvalidRangeColumnError(rangeColumn!),
  )

  // we prefer the range column over the orderBy column
  //  if both are given, we need to sort manually later
  const keyPath = rangeColumn ?? orderByColumn ?? null

  const keyPathIsIndex = isNotNull(keyPath) ? indexes.includes(keyPath) : false

  // we need to manually sort if a range is given that doesn't match the orderBy column
  //  or if the orderBy column is not indexed
  const requiresManualSort =
    !keyPathIsIndex || (isNotNull(rangeColumn) && rangeColumn !== orderByColumn)

  // null means we sort by primary key
  const indexName = keyPathIsIndex ? keyPath : null

  const direction = getOrDefault(props.orderBy?.direction, 'asc')

  const where = getOrNull(props.where)
  const range = getOrNull(props.range)
  const limit = getOrDefault(props.limit, Infinity)
  const offset = getOrDefault(props.offset, 0)

  // we have now planned the query and can finally open the cursor

  const cursor = await openCursor<TRow>(
    objectStore,
    indexName,
    direction,
    range,
  )

  return {
    iterator: filteredIterator(cursorIterator(cursor), where, limit, offset),
    byColumn: orderByColumn as Nullable<keyof TRow>,
    direction,
    requiresManualSort,
  }
}
