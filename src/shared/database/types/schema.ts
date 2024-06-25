import {
  type ColumnType,
  type KeyRange,
  type OrderBy,
  type OrderByDirection,
  type WhereBooleanOperator,
  type WhereOperator,
} from '@database/types/database'
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
   * Check if the column equals the value
   * @example
   * ```ts
   * db
   *  .table(usersTable)
   *  .findMany({
   *    where: usersTable.userName.equals('admin'),
   *  })
   * ```
   */
  equals: (value: TColumn) => WhereBuilder<TRow, TColumn>
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
  lessThan: (value: number | Date) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column is less than or equal to the value
   */
  lessThanOrEquals: (value: number | Date) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column is greater than the value
   */
  greaterThan: (value: number | Date) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column is greater than or equal to the value
   */
  greaterThanOrEquals: (value: number | Date) => WhereBuilder<TRow, TColumn>
  /***
   * Shorthand for {@link lessThan}
   */
  lt: (value: number | Date) => WhereBuilder<TRow, TColumn>
  /***
   * Shorthand for {@link lessThanOrEquals}
   */
  lte: (value: number | Date) => WhereBuilder<TRow, TColumn>
  /***
   * Shorthand for {@link greaterThan}
   */
  gt: (value: number | Date) => WhereBuilder<TRow, TColumn>
  /***
   * Shorthand for {@link greaterThanOrEquals}
   */
  gte: (value: number | Date) => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column is null
   */
  isNull: () => WhereBuilder<TRow, TColumn>
  /***
   * Check if the column is not null
   */
  isNotNull: () => WhereBuilder<TRow, TColumn>
}

export interface WhereBuilder<TRow extends object, TColumn = unknown> {
  readonly _: {
    raw: RawWhere
  }
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

export interface KeyRangeFactory<
  TRow extends object = object,
  TColumn = unknown,
> {
  /***
   * column >= value
   */
  greaterThanOrEquals: (
    value: TColumn,
    open?: boolean,
  ) => KeyRange<TRow, TColumn>
  /***
   * value > column
   */
  greaterThan: (value: TColumn) => KeyRange<TRow, TColumn>
  /***
   * column <= value
   */
  lowerThanOrEquals: (value: TColumn, open?: boolean) => KeyRange<TRow, TColumn>
  /***
   * value < column
   */
  lowerThan: (value: TColumn) => KeyRange<TRow, TColumn>
  /***
   * lower <= column <= upper
   */
  between: (
    lower?: TColumn,
    upper?: TColumn,
    lowerOpen?: boolean,
    upperOpen?: boolean,
  ) => KeyRange<TRow, TColumn>
  /***
   * lower < column < upper
   */
  betweenExclusive: (lower: TColumn, upper: TColumn) => KeyRange<TRow, TColumn>
  /***
   * column == value
   */
  only: (value: TColumn) => KeyRange<TRow, TColumn>
}

export interface OrderByColumnFactory<TRow extends object, TColumn = unknown> {
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
  tableName: Nullable<string>
  columnName: Nullable<string>
  dataType: Nullable<ColumnType>
  isPrimaryKey: boolean
  isNullable: boolean
  isIndexed: boolean
  isUnique: boolean
}

export interface ColumnDefinition<TRow extends object, TColumn = unknown>
  extends OrderByColumnFactory<TRow, TColumn>,
    WhereConditionFactory<TRow, TColumn> {
  readonly _: {
    raw: ColumnDefinitionRaw<TRow, TColumn>
  }
  readonly range: KeyRangeFactory<TRow, TColumn>
}

export interface ColumnBuilder<TColumn = unknown, TRow extends object = object>
  extends ColumnDefinition<TRow, TColumn> {
  /***
   * Set the column as the primary key
   *
   * **Note:** Only one column can be the primary key
   */
  primaryKey: () => ColumnBuilder<TColumn, TRow>
  /***
   * Set the column as nullable
   */
  nullable: () => ColumnBuilder<Nullable<TColumn>, TRow>
  /***
   * Create an index on the column
   */
  indexed: () => ColumnBuilder<TColumn, TRow>
  /***
   * Create a unique index on the column
   */
  unique: () => ColumnBuilder<TColumn, TRow>
}

export interface ColumnBuilderFactoryBase<TRow extends object = object> {
  /***
   * Create a column with the text data type.
   *
   * | JavaScript Type | PostgreSQL Type  |
   * |-----------------|------------------|
   * | string          | text             |
   */
  text: () => ColumnBuilder<string, TRow>
  /***
   * alias for {@link text}
   */
  string: () => ColumnBuilder<string, TRow>
  /***
   * Create a column with the double data type.
   *
   * | JavaScript Type | PostgreSQL Type  |
   * |-----------------|------------------|
   * | number          | double precision |
   */
  double: () => ColumnBuilder<number, TRow>
  /***
   * Create a column with the integer data type.
   *
   * | JavaScript Type | PostgreSQL Type |
   * |-----------------|-----------------|
   * | number          | integer         |
   */
  integer: () => ColumnBuilder<number, TRow>
  /***
   * alias for {@link double}
   */
  number: () => ColumnBuilder<number, TRow>
  /***
   * Create a column with the boolean data type.
   *
   * | JavaScript Type | PostgreSQL Type |
   * |-----------------|-----------------|
   * | boolean         | boolean         |
   */
  boolean: () => ColumnBuilder<boolean, TRow>
  /***
   * Create a column with the date time data type.
   *
   * | JavaScript Type    | PostgreSQL Type   |
   * |--------------------|-------------------|
   * | Date               | timestamp         |
   */
  datetime: () => ColumnBuilder<Date, TRow>
  /***
   * Create a column with the date data type.
   *
   * | JavaScript Type    | PostgreSQL Type   |
   * |--------------------|-------------------|
   * | Date               | date              |
   */
  date: () => ColumnBuilder<Date, TRow>
  /***
   * Create a column with the time data type.
   *
   * | JavaScript Type    | PostgreSQL Type   |
   * |--------------------|-------------------|
   * | string (ISO 8601)  | time              |
   */
  time: () => ColumnBuilder<string, TRow>
  /***
   * Create a column with the interval data type.
   *
   * | JavaScript Type    | PostgreSQL Type   |
   * |--------------------|-------------------|
   * | string (ISO 8601)  | interval          |
   */
  interval: () => ColumnBuilder<string, TRow>
  /***
   * Create a column with the uuid data type.
   *
   * | JavaScript Type | PostgreSQL Type |
   * |-----------------|-----------------|
   * | string          | uuid            |
   */
  uuid: () => ColumnBuilder<string, TRow>
  /***
   * Create a column with the json data type.
   *
   * | JavaScript Type | PostgreSQL Type |
   * |-----------------|-----------------|
   * | object          | json            |
   */
  json: <T extends object = object>() => ColumnBuilder<T, TRow>
}

export type MagicColumnBuilder = {
  /***
   * Create a column definition with an explicit column name.
   *
   * Can be used to generate a where condition without a table schema.
   * @example
   * ```ts
   * tx.table('users').findMany({
   *  where: c('name').equals('admin'),
   * })
   * ```
   */
  (columnName: string): ColumnBuilderFactory
  /***
   * Create a column definition for a column on a table.
   *
   * Can be used to generate a where condition without a table schema.
   * @example
   * ```ts
   * tx.table('users').findMany({
   *  where: c('users', 'name').equals('admin'),
   * })
   * ```
   */
  <TRow extends object>(
    tableName: string,
    columnName: string,
  ): ColumnBuilderFactory<TRow>
} & ColumnBuilderFactoryBase

export interface ColumnBuilderFactory<TRow extends object = object>
  extends ColumnBuilderFactoryBase<TRow>,
    ColumnDefinition<TRow> {}

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
  /***
   * Set the column as nullable.
   */
  setNullable: (nullable?: boolean) => AlterColumnBuilder
  /***
   * Set the column as not nullable.
   */
  dropNullable: () => AlterColumnBuilder
  /***
   * Create an index on the column.
   */
  setIndexed: (indexed?: boolean) => AlterColumnBuilder
  /***
   * Drop the index on the column.
   */
  dropIndexed: () => AlterColumnBuilder
  /***
   * Create a unique index on the column.
   */
  setUnique: (unique?: boolean) => AlterColumnBuilder
  /***
   * Drop the unique index on the column.
   */
  dropUnique: () => AlterColumnBuilder
  /***
   * Change the data type of the column.
   */
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
  readonly _: {
    actions: Array<AlterTableAction>
  }
  /***
   * Rename the table.
   * This alteration will be applied last.
   *
   * **Note:** You should only call this method once.
   */
  renameTo: (newTableName: string) => void
  /***
   * Add a new column to the table.
   */
  addColumn: (columnName: string) => ColumnBuilderFactory
  /***
   * Drop a column from the table.
   */
  dropColumn: (columnName: string) => void
  /***
   * Rename a column.
   */
  renameColumn: (columnName: string, newColumnName: string) => void
  /***
   * Alter a column.
   */
  alterColumn: (columnName: string) => AlterColumnBuilder
}

export type TableSchemaRaw<
  TRow extends object = {
    [key: string]: any
  },
> = {
  tableName: string
  primaryKey: string
  columns: {
    [K in keyof TRow]: ColumnDefinitionRaw<TRow, TRow[K]>
  }
}

export type TableSchemaBase<TRow extends object> = {
  readonly _: {
    raw: TableSchemaRaw<TRow>
  }
}

export type TableSchema<TRow extends object = object> =
  TableSchemaBase<TRow> & {
    [K in keyof TRow]: ColumnDefinition<TRow, TRow[K]>
  }

export type DatabaseSchema = {
  [key: string]: object
}

export type InferTable<T> = T extends TableSchema<infer U> ? U : never
