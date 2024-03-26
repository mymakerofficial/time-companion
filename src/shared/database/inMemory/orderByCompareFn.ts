import type { OrderByInput } from '@shared/database/database'
import { asArray, firstOf } from '@shared/lib/utils/list'
import { entriesOf } from '@shared/lib/utils/object'

export function orderByCompareFn<TData extends object>(
  a: TData,
  b: TData,
  orderBy?: OrderByInput<TData> | Array<OrderByInput<TData>>,
): number {
  if (!orderBy) {
    return 0
  }

  const order = asArray(orderBy)

  const comparisons = order.map((value) => {
    const [key, direction] = firstOf(entriesOf(value))

    const aValue = a[key]
    const bValue = b[key]

    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1
    }

    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1
    }

    return 0
  })

  return comparisons.find((value) => value !== 0) ?? 0
}
