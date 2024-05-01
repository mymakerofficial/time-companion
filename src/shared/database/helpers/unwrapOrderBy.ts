import type {
  OrderByDirection,
  OrderByInput,
} from '@shared/database/types/database'
import { firstOf } from '@shared/lib/utils/list'
import { entriesOf } from '@shared/lib/utils/object'
import type { Maybe, Nullable } from '@shared/lib/utils/types'
import { isAbsent } from '@shared/lib/utils/checks'
import { getOrThrow } from '@shared/lib/utils/result'

export type UnwrapOrderBy<TData extends object> = {
  key: keyof TData
  direction: OrderByDirection
}

export function unwrapOrderBy<TData extends object>(
  orderBy: OrderByInput<TData>,
): UnwrapOrderBy<TData> {
  const [key, direction] = getOrThrow(
    firstOf(entriesOf(orderBy)),
    'Invalid order by.',
  )

  return {
    key,
    direction: direction as OrderByDirection,
  }
}

export function maybeUnwrapOrderBy<TData extends object>(
  orderBy: Maybe<OrderByInput<TData>>,
): Nullable<UnwrapOrderBy<TData>> {
  if (isAbsent(orderBy)) {
    return null
  }

  return unwrapOrderBy(orderBy)
}
