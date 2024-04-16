import type { OrderByInput } from '@shared/database/database'
import { asArray, firstOf } from '@shared/lib/utils/list'
import { entriesOf } from '@shared/lib/utils/object'
import { unwrapOrderBy } from '@shared/database/helpers/unwrapOrderBy'

export function orderByCompareFn<TData extends object>(
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
