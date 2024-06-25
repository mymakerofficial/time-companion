import type { WhereOperator } from '@database/types/database'

const pgOperatorMap: Record<WhereOperator, string> = {
  equals: '=',
  notEquals: '!=',
  greaterThan: '>',
  greaterThanOrEquals: '>=',
  lessThan: '<',
  lessThanOrEquals: '<=',
  inArray: 'in',
  notInArray: 'not in',
  contains: 'like',
  notContains: 'not like',
}

export function genericOperatorToPgOperator(operator: WhereOperator): string {
  return pgOperatorMap[operator]
}
