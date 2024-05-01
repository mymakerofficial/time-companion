import type { WhereInput } from '@shared/database/types/database'
import {
  maybeUnwrapWhere,
  type UnwrapWhere,
  unwrapWhere,
  type UnwrapWhereBooleanGroup,
  type UnwrapWhereCondition,
} from '@shared/database/helpers/unwrapWhere'
import { isAbsent } from '@shared/lib/utils/checks'
import type { Maybe, Nullable } from '@shared/lib/utils/types'

function resolveBooleanGroup<TData extends object>(
  data: TData,
  { booleanOperator, conditions }: UnwrapWhereBooleanGroup<TData>,
): boolean {
  if (booleanOperator === 'AND') {
    return conditions.every((condition) =>
      unwrappedWherePredicateFn(data, condition),
    )
  }
  if (booleanOperator === 'OR') {
    return conditions.some((condition) =>
      unwrappedWherePredicateFn(data, condition),
    )
  }

  return false
}

function resolveCondition<TData extends object>(
  data: TData,
  { key, operator, value }: UnwrapWhereCondition<TData>,
): boolean {
  if (operator === 'equals') {
    return data[key] === value
  }
  if (operator === 'notEquals') {
    return data[key] !== value
  }
  if (operator === 'contains') {
    return (data[key] as string).includes(value)
  }
  if (operator === 'notContains') {
    return !(data[key] as string).includes(value)
  }
  if (operator === 'in') {
    return (value as Array<(typeof data)[typeof key]>).includes(data[key])
  }
  if (operator === 'notIn') {
    return !(value as Array<(typeof data)[typeof key]>).includes(data[key])
  }
  if (operator === 'lt') {
    return data[key] < value
  }
  if (operator === 'lte') {
    return data[key] <= value
  }
  if (operator === 'gt') {
    return data[key] > value
  }
  if (operator === 'gte') {
    return data[key] >= value
  }

  return false
}
export function unwrappedWherePredicateFn<TData extends object>(
  data: TData,
  unwrappedWhere: Maybe<UnwrapWhere<TData>>,
): boolean {
  if (isAbsent(unwrappedWhere)) {
    return true
  }

  if (unwrappedWhere.type === 'booleanGroup') {
    return resolveBooleanGroup(data, unwrappedWhere)
  } else if (unwrappedWhere.type === 'condition') {
    return resolveCondition(data, unwrappedWhere)
  }

  return false
}

// checks if the data matches the where input
export function unwrappedWherePredicate<TData extends object>(
  unwrappedWhere: Nullable<UnwrapWhere<TData>>,
): (data: TData) => boolean {
  return (data) => unwrappedWherePredicateFn(data, unwrappedWhere)
}

function wherePredicateFn<TData extends object>(
  data: TData,
  where: Maybe<WhereInput<TData>>,
): boolean {
  if (isAbsent(where)) {
    return true
  }

  const unwrappedWhere = unwrapWhere(where)

  return unwrappedWherePredicateFn(data, unwrappedWhere)
}

// checks if the data matches the where input
export function wherePredicate<TData extends object>(
  where?: WhereInput<TData>,
): (data: TData) => boolean {
  const unwrappedWhere = maybeUnwrapWhere(where)

  return (data) => unwrappedWherePredicateFn(data, unwrappedWhere)
}
