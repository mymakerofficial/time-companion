import { isAbsent } from '@shared/lib/utils/checks'
import type { Maybe } from '@shared/lib/utils/types'
import type {
  RawWhere,
  RawWhereBooleanGroup,
  RawWhereCondition,
} from '@shared/database/types/schema'

function resolveBooleanGroup<TData extends object>(
  data: TData,
  { booleanOperator, conditions }: RawWhereBooleanGroup<TData>,
): boolean {
  if (booleanOperator === 'and') {
    return conditions.every((condition) => wherePredicateFn(data, condition))
  }
  if (booleanOperator === 'or') {
    return conditions.some((condition) => wherePredicateFn(data, condition))
  }

  return false
}

function resolveCondition<TData extends object>(
  data: TData,
  { column, operator, value }: RawWhereCondition<TData>,
): boolean {
  const columnName = column.columnName as keyof TData

  if (operator === 'equals') {
    return data[columnName] === value
  }
  if (operator === 'notEquals') {
    return data[columnName] !== value
  }
  if (operator === 'contains') {
    return (data[columnName] as string).includes(value)
  }
  if (operator === 'notContains') {
    return !(data[columnName] as string).includes(value)
  }
  if (operator === 'in') {
    return (value as Array<unknown>).includes(data[columnName])
  }
  if (operator === 'notIn') {
    return !(value as Array<unknown>).includes(data[columnName])
  }
  if (operator === 'lt') {
    return data[columnName] < value
  }
  if (operator === 'lte') {
    return data[columnName] <= value
  }
  if (operator === 'gt') {
    return data[columnName] > value
  }
  if (operator === 'gte') {
    return data[columnName] >= value
  }
  if (operator === 'isNull') {
    return data[columnName] === null
  }
  if (operator === 'isNotNull') {
    return data[columnName] !== null
  }

  return false
}
export function wherePredicateFn<TData extends object>(
  data: TData,
  where: Maybe<RawWhere<TData>>,
): boolean {
  if (isAbsent(where)) {
    return true
  }

  if (where.type === 'booleanGroup') {
    return resolveBooleanGroup(data, where)
  } else if (where.type === 'condition') {
    return resolveCondition(data, where)
  }

  return false
}

// checks if the data matches the where input
export function wherePredicate<TData extends object>(
  where: Maybe<RawWhere<TData>>,
): (data: TData) => boolean {
  if (isAbsent(where)) {
    return () => true
  }

  return (data) => wherePredicateFn(data, where)
}
