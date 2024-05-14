import type { WhereOperator } from '@shared/database/types/database'

const pgOperatorMap: Record<WhereOperator, string> = {
  equals: '=',
  notEquals: '!=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  in: 'in',
  notIn: 'not in',
  isNull: 'is null',
  isNotNull: 'is not null',
  contains: 'like',
  notContains: 'not like',
}

export function genericOperatorToPgOperator(operator: WhereOperator): string {
  return pgOperatorMap[operator]
}
