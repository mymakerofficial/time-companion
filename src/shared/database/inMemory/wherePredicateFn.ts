import type { WhereInput } from '@shared/database/database'
import {
  unwrapWhere,
  type UnwrapWhereBooleanGroup,
  type UnwrapWhereCondition,
} from '@shared/database/where/unwrapWhere'
import { isUndefined } from '@shared/lib/utils/checks'

function resolveBooleanGroup<TData extends object>(
  data: TData,
  { booleanOperator, conditions }: UnwrapWhereBooleanGroup<TData>,
): boolean {
  if (booleanOperator === 'AND') {
    return conditions.every((condition) => wherePredicateFn(data, condition))
  }
  if (booleanOperator === 'OR') {
    return conditions.some((condition) => wherePredicateFn(data, condition))
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

export function wherePredicateFn<TData extends object>(
  data: TData,
  where?: WhereInput<TData>,
): boolean {
  if (isUndefined(where)) {
    return true
  }

  const { type, ...unwrappedWhere } = unwrapWhere(where)

  if (type === 'booleanGroup') {
    return resolveBooleanGroup(
      data,
      unwrappedWhere as UnwrapWhereBooleanGroup<TData>,
    )
  } else if (type === 'condition') {
    return resolveCondition(data, unwrappedWhere as UnwrapWhereCondition<TData>)
  }

  return false
}
