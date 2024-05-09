import {
  type ColumnType,
  type OrderBy,
  type OrderByDirection,
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

export type WhereConditionFactory<TColumn> = {
  [O in WhereEqualityOperator]: (value: TColumn) => WhereBuilder<TColumn>
} & {
  [O in WhereStringOperator]: (value: string) => WhereBuilder<TColumn>
} & {
  [O in WhereListOperator]: (value: Array<TColumn>) => WhereBuilder<TColumn>
} & {
  [O in WhereNumberOperator]: (value: number) => WhereBuilder<TColumn>
} & {
  [O in WhereNullabilityOperator]: () => WhereBuilder<TColumn>
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

export type OrderByColumnFactory<TColumn> = {
  [D in OrderByDirection]: () => OrderBy<TColumn>
} & {
  direction: (direction: OrderByDirection) => OrderBy<TColumn>
}

export type ColumnDefinitionRaw<TColumn> = {
  tableName: string
  columnName: string
  dataType: ColumnType
  isPrimaryKey: boolean
  isNullable: boolean
}

export type ColumnDefinitionBase<TColumn> = {
  _: {
    raw: ColumnDefinitionRaw<TColumn>
    where: (operator: WhereOperator, value: any) => WhereBuilder<TColumn>
  }
} & OrderByColumnFactory<TColumn>

export type ColumnDefinition<TColumn> = ColumnDefinitionBase<TColumn> &
  WhereConditionFactory<TColumn>

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
