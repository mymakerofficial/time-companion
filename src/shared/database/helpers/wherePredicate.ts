import { isAbsent } from '@shared/lib/utils/checks'
import type { Maybe } from '@shared/lib/utils/types'
import type {
  RawWhere,
  RawWhereBooleanGroup,
  RawWhereCondition,
} from '@shared/database/types/schema'

function resolveBooleanGroup<TRow extends object>(
  data: TRow,
  { booleanOperator, conditions }: RawWhereBooleanGroup,
): boolean {
  if (booleanOperator === 'and') {
    return conditions.every((condition) => wherePredicateFn(data, condition))
  }
  if (booleanOperator === 'or') {
    return conditions.some((condition) => wherePredicateFn(data, condition))
  }

  return false
}

function resolveCondition<TRow extends object>(
  data: TRow,
  { column, operator, value }: RawWhereCondition,
): boolean {
  const columnName = column.columnName as keyof TRow

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
  if (operator === 'inArray') {
    return (value as Array<unknown>).includes(data[columnName])
  }
  if (operator === 'notInArray') {
    return !(value as Array<unknown>).includes(data[columnName])
  }
  if (operator === 'lessThan') {
    return data[columnName] < value
  }
  if (operator === 'lessThanOrEquals') {
    return data[columnName] <= value
  }
  if (operator === 'greaterThan') {
    return data[columnName] > value
  }
  if (operator === 'greaterThanOrEquals') {
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
export function wherePredicateFn<TRow extends object>(
  data: TRow,
  where: Maybe<RawWhere>,
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
export function wherePredicate<TRow extends object>(
  where: Maybe<RawWhere>,
): (data: TRow) => boolean {
  if (isAbsent(where)) {
    return () => true
  }

  return (data) => wherePredicateFn(data, where)
}
