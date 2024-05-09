import {
  type ColumnType,
  type WhereBooleanOperator,
  type WhereEqualityOperator,
  type WhereListOperator,
  type WhereNullabilityOperator,
  type WhereNumberOperator,
  type WhereOperator,
  type WhereStringOperator,
} from '@shared/database/types/database'
import type { Nullable } from '@shared/lib/utils/types'

export type RawWhereCondition<T> = {
  column: ColumnDefinitionRaw<T>
  operator: WhereOperator
  value: any
}

export type RawWhereBooleanGroup<T> = {
  booleanOperator: WhereBooleanOperator
  conditions: Array<RawWhere<T>>
}

export type RawWhere<T> =
  | ({ type: 'booleanGroup' } & RawWhereBooleanGroup<T>)
  | ({ type: 'condition' } & RawWhereCondition<T>)

export type WhereConditionFactory<T> = {
  [O in WhereEqualityOperator]: (value: T) => WhereBuilder<T>
} & {
  [O in WhereStringOperator]: (value: string) => WhereBuilder<T>
} & {
  [O in WhereListOperator]: (value: Array<T>) => WhereBuilder<T>
} & {
  [O in WhereNumberOperator]: (value: number) => WhereBuilder<T>
} & {
  [O in WhereNullabilityOperator]: () => WhereBuilder<T>
}

export type WhereBuilder<T> = {
  _: {
    raw: RawWhere<T>
  }
} & {
  [O in WhereBooleanOperator]: {
    <G>(other: WhereBuilder<G>): WhereBuilder<T>
  }
}

export type ColumnDefinitionRaw<T> = {
  tableName: string
  columnName: string
  dataType: ColumnType
  isPrimaryKey: boolean
  isNullable: boolean
}

export type ColumnDefinitionBase<T> = {
  _: {
    raw: ColumnDefinitionRaw<T>
    where: (operator: WhereOperator, value: any) => WhereBuilder<T>
  }
}

export type ColumnDefinition<T> = ColumnDefinitionBase<T> &
  WhereConditionFactory<T>

export type ColumnBuilder<T> = {
  _: {
    raw: ColumnDefinitionRaw<T>
  }
  primaryKey: () => ColumnBuilder<T>
  nullable: () => ColumnBuilder<Nullable<T>>
}

export type TableSchemaRaw<T extends object> = {
  tableName: string
  primaryKey: string
  columns: {
    [K in keyof T]: ColumnDefinitionRaw<T[K]>
  }
}

export type TableSchemaBase<T extends object> = {
  _: {
    raw: TableSchemaRaw<T>
  }
}

export type TableSchema<T extends object> = TableSchemaBase<T> & {
  [K in keyof T]: ColumnDefinition<T[K]>
}

export type InferTable<T> = T extends TableSchema<infer U> ? U : never
