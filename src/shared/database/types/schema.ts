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
  column: ColumnDefinitionRaw<object, never>
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

export type WhereConditionFactory<
  TRow extends object,
  TColumn extends TRow[keyof TRow],
> = {
  [O in WhereEqualityOperator]: (
    value: TColumn | ColumnDefinition<any, TColumn>,
  ) => WhereBuilder<TRow, TColumn>
} & {
  [O in WhereStringOperator]: (value: string) => WhereBuilder<TRow, TColumn>
} & {
  [O in WhereListOperator]: (
    value: Array<TColumn>,
  ) => WhereBuilder<TRow, TColumn>
} & {
  [O in WhereNumberOperator]: (value: number) => WhereBuilder<TRow, TColumn>
} & {
  [O in WhereNullabilityOperator]: () => WhereBuilder<TRow, TColumn>
}

export type WhereBuilder<TRow extends object, TColumn = unknown> = {
  _: {
    raw: RawWhere
  }
} & {
  [O in WhereBooleanOperator]: {
    <GRow extends object, GColumn>(
      other: WhereBuilder<GRow, GColumn>,
    ): WhereBuilder<TRow | GRow, TColumn | GColumn>
  }
}

export type WhereBuilderOrRaw<TRow extends object, TColumn = unknown> =
  | WhereBuilder<TRow, TColumn>
  | RawWhere

export type OrderByColumnFactory<
  TRow extends object,
  TColumn extends TRow[keyof TRow],
> = {
  [D in OrderByDirection]: () => OrderBy<TRow, TColumn>
} & {
  direction: (direction: OrderByDirection) => OrderBy<TRow, TColumn>
}

export type ColumnDefinitionRaw<TRow extends object, TColumn> = {
  tableName: string
  columnName: string
  dataType: ColumnType
  isPrimaryKey: boolean
  isNullable: boolean
  isIndexed: boolean
  isUnique: boolean
}

export type ColumnDefinitionBase<
  TRow extends object,
  TColumn extends TRow[keyof TRow],
> = {
  _: {
    raw: ColumnDefinitionRaw<TRow, TColumn>
    where: (operator: WhereOperator, value: any) => WhereBuilder<TRow, TColumn>
  }
} & OrderByColumnFactory<TRow, TColumn>

export type ColumnDefinition<
  TRow extends object,
  TColumn extends TRow[keyof TRow],
> = ColumnDefinitionBase<TRow, TColumn> & WhereConditionFactory<TRow, TColumn>

export interface ColumnBuilder<TColumn> {
  _: {
    raw: ColumnDefinitionRaw<any, TColumn>
  }
  primaryKey: () => ColumnBuilder<TColumn>
  nullable: () => ColumnBuilder<Nullable<TColumn>>
  indexed: () => ColumnBuilder<TColumn>
  unique: () => ColumnBuilder<TColumn>
}

export interface ColumnBuilderFactory {
  string: () => ColumnBuilder<string>
  // alias for double
  number: () => ColumnBuilder<number>
  boolean: () => ColumnBuilder<boolean>
  uuid: () => ColumnBuilder<string>
  double: () => ColumnBuilder<number>
  integer: () => ColumnBuilder<number>
  json: <T extends object = object>() => ColumnBuilder<T>
}

export type TableSchemaRaw<TRow extends object> = {
  tableName: string
  primaryKey: string
  columns: {
    [K in keyof TRow]: ColumnDefinitionRaw<TRow, TRow[K]>
  }
}

export type TableSchemaBase<TRow extends object> = {
  _: {
    raw: TableSchemaRaw<TRow>
  }
}

export type TableSchema<TRow extends object> = TableSchemaBase<TRow> & {
  [K in keyof TRow]: ColumnDefinition<TRow, TRow[K]>
}

export type InferTable<T> = T extends TableSchema<infer U> ? U : never
