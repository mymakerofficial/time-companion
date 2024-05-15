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

export type RawWhereCondition = {
  column: ColumnDefinitionRaw<unknown>
  operator: WhereOperator
  value: any
}

export type RawWhereBooleanGroup = {
  booleanOperator: WhereBooleanOperator
  conditions: Array<RawWhere>
}

export type RawWhere =
  | ({ type: 'booleanGroup' } & RawWhereBooleanGroup)
  | ({ type: 'condition' } & RawWhereCondition)

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
    raw: RawWhere
  }
} & {
  [O in WhereBooleanOperator]: {
    <G>(other: WhereBuilder<G>): WhereBuilder<T>
  }
}

export type WhereBuilderOrRaw<T> = WhereBuilder<T> | RawWhere

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
  isIndexed: boolean
  isUnique: boolean
}

export type ColumnDefinitionBase<TColumn> = {
  _: {
    raw: ColumnDefinitionRaw<TColumn>
    where: (operator: WhereOperator, value: any) => WhereBuilder<TColumn>
  }
} & OrderByColumnFactory<TColumn>

export type ColumnDefinition<TColumn> = ColumnDefinitionBase<TColumn> &
  WhereConditionFactory<TColumn>

export interface ColumnBuilder<TColumn> {
  _: {
    raw: ColumnDefinitionRaw<TColumn>
  }
  primaryKey: () => ColumnBuilder<TColumn>
  nullable: () => ColumnBuilder<Nullable<TColumn>>
  indexed: () => ColumnBuilder<TColumn>
  unique: () => ColumnBuilder<TColumn>
}

export interface ColumnBuilderFactory {
  string: () => ColumnBuilder<string>
  number: () => ColumnBuilder<number>
  boolean: () => ColumnBuilder<boolean>
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
