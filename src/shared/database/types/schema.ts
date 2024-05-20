import {
  type ColumnType,
  type OrderBy,
  type OrderByDirection,
  type WhereBooleanOperator,
  type WhereOperator,
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

export type WhereConditionFactory<TRow extends object, TColumn = unknown> = {
  /***
   * Check if the column equals the value or another column
   * @example
   * ```ts
   * db
   *  .table(usersTable)
   *  .findMany({
   *    where: usersTable.userName.equals('admin'),
   *  })
   * ```
   * @example
   * ```ts
   * db
   *  .table(usersTable)
   *  .leftJoin({
   *    on: usersTable.id.equals(projectsTable.userId),
   *  })
   *  .findMany()
   * ```
   */
  equals: (
    value: TColumn | ColumnDefinition<any, TColumn>,
  ) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column does not equal the value
   * @example
   * ```ts
   * db
   *  .table(usersTable)
   *  .findMany({
   *    where: usersTable.userName.notEquals('admin'),
   *  })
   * ```
   */
  notEquals: (value: TColumn) => WhereBuilder<TRow, TColumn>
  /***
   * Shorthand for {@link equals}
   */
  eq: (
    value: TColumn | ColumnDefinition<any, TColumn>,
  ) => WhereBuilder<TRow, TColumn>
  /***
   * Shorthand for {@link notEquals}
   */
  neq: (value: TColumn) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column contains the value
   */
  contains: (value: string) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column does not contain the value
   */
  notContains: (value: string) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column is contained in the array
   */
  inArray: (values: Array<TColumn>) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column is not contained in the array
   */
  notInArray: (values: Array<TColumn>) => WhereBuilder<TRow, TColumn>
  /***
   * Shorthand for {@link inArray}
   */
  in: (values: Array<TColumn>) => WhereBuilder<TRow, TColumn>
  /***
   * Shorthand for {@link notInArray}
   */
  notIn: (values: Array<TColumn>) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column is less than the value
   */
  lessThan: (value: number) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column is less than or equal to the value
   */
  lessThanOrEquals: (value: number) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column is greater than the value
   */
  greaterThan: (value: number) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column is greater than or equal to the value
   */
  greaterThanOrEquals: (value: number) => WhereBuilder<TRow, TColumn>
  /***
   * Shorthand for {@link lessThan}
   */
  lt: (value: number) => WhereBuilder<TRow, TColumn>
  /***
   * Shorthand for {@link lessThanOrEquals}
   */
  lte: (value: number) => WhereBuilder<TRow, TColumn>
  /***
   * Shorthand for {@link greaterThan}
   */
  gt: (value: number) => WhereBuilder<TRow, TColumn>
  /***
   * Shorthand for {@link greaterThanOrEquals}
   */
  gte: (value: number) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column is null
   */
  isNull: () => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column is not null
   */
  isNotNull: () => WhereBuilder<TRow, TColumn>
}

export type WhereBuilder<TRow extends object, TColumn = unknown> = {
  _: {
    raw: RawWhere
  }
} & {
  /***
   * Groups the previous condition with the next condition using the AND operator
   */
  and: <GRow extends object, GColumn>(
    other: WhereBuilder<GRow, GColumn>,
  ) => WhereBuilder<TRow | GRow, TColumn | GColumn>
  /***
   * Groups the previous condition with the next condition using the OR operator
   */
  or: <GRow extends object, GColumn>(
    other: WhereBuilder<GRow, GColumn>,
  ) => WhereBuilder<TRow | GRow, TColumn | GColumn>
}

export type WhereBuilderOrRaw<TRow extends object, TColumn = unknown> =
  | WhereBuilder<TRow, TColumn>
  | RawWhere

export type OrderByColumnFactory<TRow extends object, TColumn = unknown> = {
  /***
   * Order the results by this column in ascending order
   */
  asc: () => OrderBy<TRow, TColumn>
  /***
   * Order the results by this column in descending order
   */
  desc: () => OrderBy<TRow, TColumn>
  /***
   * Order the results by this column in the specified direction
   */
  direction: (direction: OrderByDirection) => OrderBy<TRow, TColumn>
  /***
   * Shorthand for {@link direction}
   */
  dir: (direction: OrderByDirection) => OrderBy<TRow, TColumn>
}

export type ColumnDefinitionRaw<
  TRow extends object = object,
  TColumn = unknown,
> = {
  tableName: string
  columnName: string
  dataType: ColumnType
  isPrimaryKey: boolean
  isNullable: boolean
  isIndexed: boolean
  isUnique: boolean
}

export type ColumnDefinitionBase<TRow extends object, TColumn = unknown> = {
  _: {
    raw: ColumnDefinitionRaw<TRow, TColumn>
  }
} & OrderByColumnFactory<TRow, TColumn>

export type ColumnDefinition<
  TRow extends object,
  TColumn = unknown,
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

export type AlterColumnSetNullableAction = {
  type: 'setNullable'
  nullable: boolean
}

export type AlterColumnSetIndexedAction = {
  type: 'setIndexed'
  indexed: boolean
}

export type AlterColumnSetUniqueAction = {
  type: 'setUnique'
  unique: boolean
}

export type AlterColumnSetDataTypeAction = {
  type: 'setDataType'
  dataType: ColumnType
}

export type AlterColumnAction =
  | AlterColumnSetNullableAction
  | AlterColumnSetIndexedAction
  | AlterColumnSetUniqueAction
  | AlterColumnSetDataTypeAction

export interface AlterColumnBuilder {
  setNullable: (nullable?: boolean) => AlterColumnBuilder
  dropNullable: () => AlterColumnBuilder
  setIndexed: (indexed?: boolean) => AlterColumnBuilder
  dropIndexed: () => AlterColumnBuilder
  setUnique: (unique?: boolean) => AlterColumnBuilder
  dropUnique: () => AlterColumnBuilder
  setDataType: (dataType: ColumnType) => AlterColumnBuilder
}

export type AlterTableAddColumnAction = {
  type: 'addColumn'
  definition: ColumnDefinitionRaw
}

export type AlterTableAlterColumnAction = {
  type: 'alterColumn'
  columnName: string
  action: AlterColumnAction
}

export type AlterTableDropColumnAction = {
  type: 'dropColumn'
  columnName: string
}

export type AlterTableRenameColumnAction = {
  type: 'renameColumn'
  columnName: string
  newColumnName: string
}

export type AlterTableRenameTableAction = {
  type: 'renameTable'
  newTableName: string
}

export type AlterTableAction =
  | AlterTableAddColumnAction
  | AlterTableAlterColumnAction
  | AlterTableDropColumnAction
  | AlterTableRenameColumnAction
  | AlterTableRenameTableAction

export interface AlterTableBuilder {
  _: {
    actions: Array<AlterTableAction>
  }
  renameTo: (newTableName: string) => void
  addColumn: (columnName: string) => ColumnBuilderFactory
  dropColumn: (columnName: string) => void
  renameColumn: (columnName: string, newColumnName: string) => void
  alterColumn: (columnName: string) => AlterColumnBuilder
}

export type TableSchemaRaw<TRow extends object = object> = {
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

export type DatabaseSchema = {
  [key: string]: object
}

export type InferTable<T> = T extends TableSchema<infer U> ? U : never
