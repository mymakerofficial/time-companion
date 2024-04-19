import {
  type WhereBooleanOperator,
  whereBooleanOperators,
  type WhereInput,
  type WhereOperator,
} from '@shared/database/database'
import { firstOf } from '@shared/lib/utils/list'
import { entriesOf } from '@shared/lib/utils/object'
import { isAbsent } from '@shared/lib/utils/checks'
import type { Maybe, Nullable } from '@shared/lib/utils/types'

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
  const [groupKey, groupValue] = firstOf(entriesOf(where))

  if (whereBooleanOperators.includes(groupKey as WhereBooleanOperator)) {
    return {
      type: 'booleanGroup',
      booleanOperator: groupKey as WhereBooleanOperator,
      conditions: (groupValue as Array<WhereInput<TData>>).map(unwrapWhere),
    }
  } else {
    const [operator, value] = firstOf(entriesOf(groupValue))

    return {
      type: 'condition',
      key: groupKey as keyof TData,
      operator: operator as WhereOperator,
      value: value as any,
    }
  }
}

export function maybeUnwrapWhere<TData extends object>(
  where: Maybe<WhereInput<TData>>,
): Nullable<UnwrapWhere<TData>> {
  if (isAbsent(where)) {
    return null
  }

  return unwrapWhere(where)
}
