import type { DatabaseInfo } from '@shared/database/types/adapter'
import type { Nullable } from '@shared/lib/utils/types'
import type {
  ColumnDefinitionRaw,
  InferTable,
  RawWhere,
  TableSchema,
  WhereBuilder,
  WhereBuilderOrRaw,
} from '@shared/database/types/schema'

export const whereBooleanOperators = ['and', 'or'] as const
export type WhereBooleanOperator = (typeof whereBooleanOperators)[number]

export const whereEqualityOperators = ['equals', 'notEquals'] as const
export type WhereEqualityOperator = (typeof whereEqualityOperators)[number]

export const whereStringOperators = ['contains', 'notContains'] as const
export type WhereStringOperator = (typeof whereStringOperators)[number]

export const whereListOperators = ['in', 'notIn'] as const
export type WhereListOperator = (typeof whereListOperators)[number]

export const whereNumberOperators = ['lt', 'lte', 'gt', 'gte'] as const
export type WhereNumberOperator = (typeof whereNumberOperators)[number]

export const whereNullabilityOperators = ['isNull', 'isNotNull'] as const
export type WhereNullabilityOperator =
  (typeof whereNullabilityOperators)[number]

export const whereOperators = [
  ...whereEqualityOperators,
  ...whereStringOperators,
  ...whereListOperators,
  ...whereNumberOperators,
  ...whereNullabilityOperators,
] as const

export type WhereOperator = (typeof whereOperators)[number]

export const orderDirections = ['asc', 'desc'] as const
export type OrderByDirection = (typeof orderDirections)[number]

export type OrderBy<TColumn> = {
  column: ColumnDefinitionRaw<TColumn>
  direction: OrderByDirection
}

type HasOrder<TData extends object> = {
  orderBy?: OrderBy<TData>
}

type HasOffset<TData extends object> = HasOrder<TData> & {
  offset?: number
}

type HasLimit<TData extends object> = HasOffset<TData> & {
  limit?: number
}

export type FindProps<TData extends object> = HasOffset<TData> & {
  where?: WhereBuilderOrRaw<TData>
}

export type FindManyProps<TData extends object> = FindProps<TData> &
  HasLimit<TData>

export type UpdateProps<TData extends object> = HasOffset<TData> & {
  where?: WhereBuilder<TData> | RawWhere
  data: Partial<TData>
}

export type UpdateManyProps<TData extends object> = UpdateProps<TData> &
  HasLimit<TData>

export type DeleteProps<TData extends object> = HasOffset<TData> & {
  where?: WhereBuilder<TData> | RawWhere
}

export type DeleteManyProps<TData extends object> = DeleteProps<TData> &
  HasLimit<TData>

export type InsertProps<TData extends object> = {
  data: TData
}

export type InsertManyProps<TData extends object> = {
  data: Array<TData>
}

export interface QueryableTable<TData extends object> {
  findFirst(props?: FindProps<TData>): Promise<Nullable<TData>>
  findMany(props?: FindManyProps<TData>): Promise<Array<TData>>
  update(props: UpdateProps<TData>): Promise<Nullable<TData>>
  updateMany(props: UpdateManyProps<TData>): Promise<Array<TData>>
  delete(props: DeleteProps<TData>): Promise<void>
  deleteMany(props: DeleteManyProps<TData>): Promise<void>
  deleteAll(): Promise<void>
  insert(props: InsertProps<TData>): Promise<TData>
  insertMany(props: InsertManyProps<TData>): Promise<Array<TData>>
}

export type LeftJoinProps<
  TLeftData extends object,
  TRightData extends object,
> = {
  on: {
    [K in keyof TLeftData]?: keyof TRightData
  }
  where?: WhereBuilderOrRaw<TRightData>
}

export interface JoinableTable<TLeftData extends object> {
  leftJoin<
    TRightData extends object = object,
    TRightSchema extends TableSchema<TRightData> = TableSchema<TRightData>,
  >(
    rightTable: TRightSchema | string,
    props: LeftJoinProps<TLeftData, InferTable<TRightSchema>>,
  ): JoinedTable<TLeftData, InferTable<TRightSchema>>
}

export interface Table<TData extends object>
  extends QueryableTable<TData>,
    JoinableTable<TData> {}

export interface JoinedTable<
  TLeftData extends object,
  TRightData extends object,
> extends QueryableTable<TLeftData> {}

export interface UpgradeTable<TData extends object> extends Table<TData> {
  // ...
}

export const columnTypes = ['string', 'number', 'boolean'] as const
export type ColumnType = (typeof columnTypes)[number]

export interface TableFactory {
  table<
    TData extends object = object,
    TSchema extends TableSchema<TData> = TableSchema<TData>,
  >(
    table: TSchema | string,
  ): Table<InferTable<TSchema>>
}

export interface UpgradeTableFactory extends TableFactory {
  createTable<
    TData extends object = object,
    TSchema extends TableSchema<TData> = TableSchema<TData>,
  >(
    schema: TSchema,
  ): Promise<UpgradeTable<InferTable<TSchema>>>
  table<
    TData extends object = object,
    TSchema extends TableSchema<TData> = TableSchema<TData>,
  >(
    table: TSchema | string,
  ): UpgradeTable<InferTable<TSchema>>
}

export interface Transaction extends TableFactory {}

export interface UpgradeTransaction extends UpgradeTableFactory {}

export type UpgradeFunction = (
  transaction: UpgradeTransaction,
  newVersion: number,
  oldVersion: number,
) => Promise<void>

export interface Database {
  readonly isOpen: boolean
  open(
    databaseName: string,
    version: number,
    upgrade: UpgradeFunction,
  ): Promise<void>
  close(): Promise<void>
  delete(databaseName: string): Promise<void>
  withTransaction<TResult>(
    tables: Array<TableSchema<object>> | Array<string>,
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult>
  /***
   * @deprecated use withTransaction instead
   */
  withWriteTransaction<TResult>(
    tables: Array<TableSchema<object>> | Array<string>,
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult>
  /***
   * @deprecated use withTransaction instead
   */
  withReadTransaction<TResult>(
    tables: Array<TableSchema<object>> | Array<string>,
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult>
  getDatabases(): Promise<Array<DatabaseInfo>>
  getTableNames(): Promise<Array<string>>
  getTableIndexNames(tableName: string): Promise<Array<string>>
}
