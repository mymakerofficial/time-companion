import type { AdapterBaseQueryProps } from '@database/types/adapter'
import { toArray } from '@shared/lib/utils/list'
import {
  check,
  isNotNull,
  isNull,
  isPresent,
  isUndefined,
} from '@shared/lib/utils/checks'
import { DatabaseInvalidRangeColumnError } from '@database/types/errors'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'
import type { Nullable } from '@shared/lib/utils/types'
import type { ColumnType, OrderByDirection } from '@database/types/database'
import type { RawWhere } from '@database/types/schema'

export type IDBQueryPlan<TRow extends object> = {
  /***
   * The name of the index to use. If null, use the object store itself.
   */
  indexName: Nullable<string>
  /***
   * The direction to order by
   */
  direction: OrderByDirection
  range: Nullable<IDBKeyRange>
  where: Nullable<RawWhere>
  limit: number
  offset: number
  /***
   * The name of the column to order by. If null, the result does not need to be sorted.
   */
  orderByColumnName: Nullable<keyof TRow>
  /***
   * The data type of the column to order by.
   */
  orderByColumnType: Nullable<ColumnType>
  /***
   * Whether the result needs to be manually sorted after the cursor has finished.
   */
  requiresManualSort: boolean
}

/***
 * Plans the strategy for a query based on the given props.
 */
export function planQuery<TRow extends object>(
  objectStore: IDBObjectStore,
  props: Partial<AdapterBaseQueryProps>,
): IDBQueryPlan<TRow> {
  const indexes = toArray(objectStore.indexNames)
  const primaryKey = objectStore.keyPath

  // if the range or orderBy column is the primary key, make it null
  //  we use null to indicate that we should not use an index
  //  but use the object store itself

  // undefined means there is actually no value

  const rangeColumnName =
    props.range?.column.columnName !== primaryKey
      ? props.range?.column.columnName
      : null
  const orderByColumnName =
    props.orderBy?.column.columnName !== primaryKey
      ? props.orderBy?.column.columnName
      : null

  const orderByColumnType = getOrNull(props.orderBy?.column.dataType)

  check(
    isNull(rangeColumnName) ||
      isUndefined(rangeColumnName) ||
      indexes.includes(rangeColumnName),
    () => new DatabaseInvalidRangeColumnError(rangeColumnName!),
  )

  // we prefer the range column over the orderBy column
  //  if both are given, we need to sort manually later
  const keyPath = rangeColumnName ?? orderByColumnName ?? null

  const keyPathIsIndex = isNotNull(keyPath) ? indexes.includes(keyPath) : false

  const givenOrderByIsNotIndexed =
    isPresent(orderByColumnName) && !keyPathIsIndex

  const rangeDoesntMatchOrderBy =
    isPresent(rangeColumnName) &&
    isPresent(orderByColumnName) &&
    rangeColumnName !== orderByColumnName

  const requiresManualSort = givenOrderByIsNotIndexed || rangeDoesntMatchOrderBy

  // null means we sort by primary key
  const indexName = keyPathIsIndex ? keyPath : null

  const direction = getOrDefault(props.orderBy?.direction, 'asc')

  const where = getOrNull(props.where)
  const limit = getOrDefault(props.limit, Infinity)
  const offset = getOrDefault(props.offset, 0)

  const range = isPresent(props.range)
    ? IDBKeyRange.bound(
        // turn the key range into a key range... but different
        props.range.lower,
        props.range.upper,
        props.range.lowerOpen,
        props.range.upperOpen,
      )
    : null

  return {
    indexName,
    direction,
    range,
    where,
    limit,
    offset,
    orderByColumnName: getOrNull(orderByColumnName) as Nullable<keyof TRow>,
    orderByColumnType,
    requiresManualSort,
  }
}
