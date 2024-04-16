import type { OrderByInput } from '@shared/database/database'
import { firstOf } from '@shared/lib/utils/list'
import { entriesOf } from '@shared/lib/utils/object'

export function unwrapOrderBy<TData extends object>(
  orderBy: OrderByInput<TData>,
) {
  const [key, direction] = firstOf(entriesOf(orderBy))

  return {
    key,
    direction,
  }
}
