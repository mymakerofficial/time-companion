import type { OrderByInput } from '@shared/database/types/database'
import {
  maybeUnwrapOrderBy,
  type UnwrapOrderBy,
} from '@shared/database/helpers/unwrapOrderBy'
import type { Maybe } from '@shared/lib/utils/types'

function unwrappedOrderByCompareFn<TData extends object>(
  a: TData,
  b: TData,
  unwrappedOrderBy: Maybe<UnwrapOrderBy<TData>>,
): number {
  if (!unwrappedOrderBy) {
    return 0
  }

  const { key, direction } = unwrappedOrderBy

  const aValue = a[key]
  const bValue = b[key]

  if (aValue < bValue) {
    return direction === 'asc' ? -1 : 1
  }

  if (aValue > bValue) {
    return direction === 'asc' ? 1 : -1
  }

  return 0
}

function orderByCompareFn<TData extends object>(
  a: TData,
  b: TData,
  orderBy: Maybe<OrderByInput<TData>>,
): number {
  const unwrappedOrderBy = maybeUnwrapOrderBy(orderBy)

  return unwrappedOrderByCompareFn(a, b, unwrappedOrderBy)
}

export function unwrappedOrderByCompare<TData extends object>(
  unwrappedOrderBy: Maybe<UnwrapOrderBy<TData>>,
): (a: TData, b: TData) => number {
  return (a, b) => unwrappedOrderByCompareFn(a, b, unwrappedOrderBy)
}

export function orderByCompare<TData extends object>(
  orderBy: Maybe<OrderByInput<TData>>,
): (a: TData, b: TData) => number {
  return (a, b) => orderByCompareFn(a, b, orderBy)
}
