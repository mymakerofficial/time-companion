import type { OrderByInput } from '@shared/database/database'
import { unwrapOrderBy } from '@shared/database/helpers/unwrapOrderBy'

function orderByCompareFn<TData extends object>(
  a: TData,
  b: TData,
  orderBy?: OrderByInput<TData>,
): number {
  if (!orderBy) {
    return 0
  }

  const { key, direction } = unwrapOrderBy(orderBy)

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

export function orderByCompare<TData extends object>(
  orderBy?: OrderByInput<TData>,
): (a: TData, b: TData) => number {
  return (a, b) => orderByCompareFn(a, b, orderBy)
}
