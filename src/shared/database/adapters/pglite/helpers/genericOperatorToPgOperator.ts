import type { WhereOperator } from '@shared/database/types/database'

const pgOperatorMap: Record<WhereOperator, string> = {
  equals: '=',
  notEquals: '!=',
  greaterThan: '>',
  greaterThanOrEquals: '>=',
  lessThan: '<',
  lessThanOrEquals: '<=',
  inArray: 'in',
  notInArray: 'not in',
  isNull: 'is null',
  isNotNull: 'is not null',
  contains: 'like',
  notContains: 'not like',
}

export function genericOperatorToPgOperator(operator: WhereOperator): string {
  return pgOperatorMap[operator]
}
