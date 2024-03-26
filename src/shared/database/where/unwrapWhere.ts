import {
  type WhereBooleanOperator,
  whereBooleanOperators,
  type WhereInput,
  type WhereOperator,
  whereOperators,
} from '@shared/database/database'

export type UnwrapWhereCondition<TData extends object> = {
  key: keyof TData
  operator: WhereOperator
  value: any
}

export type UnwrapWhereBooleanGroup<TData extends object> = {
  booleanOperator: WhereBooleanOperator
  conditions: Array<UnwrapWhere<TData>>
}

export type UnwrapWhere<TData extends object> =
  | ({ type: 'booleanGroup' } & UnwrapWhereBooleanGroup<TData>)
  | ({ type: 'condition' } & UnwrapWhereCondition<TData>)

export function unwrapWhere<TData extends object>(
  where: WhereInput<TData>,
): UnwrapWhere<TData> {
  const [groupKey, groupValue] = Object.entries(where)[0]

  if (whereBooleanOperators.includes(groupKey as WhereBooleanOperator)) {
    return {
      type: 'booleanGroup',
      booleanOperator: groupKey as WhereBooleanOperator,
      conditions: groupValue.map(unwrapWhere),
    }
  } else {
    const [operator, value] = Object.entries(groupValue)[0]
    return {
      type: 'condition',
      key: groupKey as keyof TData,
      operator: operator as WhereOperator,
      value: value as any,
    }
  }
}
