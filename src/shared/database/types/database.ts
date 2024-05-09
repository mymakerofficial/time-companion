import type {
  DatabaseInfo,
  DatabaseTransactionMode,
} from '@shared/database/types/adapter'
import type { Nullable } from '@shared/lib/utils/types'
import type {
  TableSchema,
  InferTable,
  WhereBuilder,
  RawWhere,
  ColumnDefinitionRaw,
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

type HasOrder<TData extends object> = {
  orderBy?: OrderBy<TData>
}

type HasOffset<TData extends object> = HasOrder<TData> & {
  offset?: number
}

type HasLimit<TData extends object> = HasOrder<TData> & {
  limit?: number
}

export type OrderBy<TColumn> = {
  column: ColumnDefinitionRaw<TColumn>
  direction: OrderByDirection
}

export type InsertArgs<TData extends object> = {
  data: TData
}

export type InsertManyArgs<TData extends object> = {
  data: Array<TData>
}

export type FindArgs<TData extends object> = HasOffset<TData> & {
  where?: WhereBuilder<TData> | RawWhere<TData>
}

export type FindManyArgs<TData extends object> = FindArgs<TData> &
  HasLimit<TData>

export type UpdateArgs<TData extends object> = HasOffset<TData> & {
  where?: WhereBuilder<TData> | RawWhere<TData>
  data: Partial<TData>
}

export type UpdateManyArgs<TData extends object> = UpdateArgs<TData> &
  HasLimit<TData>

export type DeleteArgs<TData extends object> = HasOffset<TData> & {
  where?: WhereBuilder<TData> | RawWhere<TData>
}

export type DeleteManyArgs<TData extends object> = DeleteArgs<TData> &
  HasLimit<TData>

export interface Queryable<TData extends object> {
  findFirst(args?: FindArgs<TData>): Promise<Nullable<TData>>
  findMany(args?: FindManyArgs<TData>): Promise<Array<TData>>
}

export interface Updatable<TData extends object> {
  update(args: UpdateArgs<TData>): Promise<Nullable<TData>>
  updateMany(args: UpdateManyArgs<TData>): Promise<Array<TData>>
}

export interface Deletable<TData extends object> {
  delete(args: DeleteArgs<TData>): Promise<void>
  deleteMany(args: DeleteManyArgs<TData>): Promise<void>
  deleteAll(): Promise<void>
}

export interface Insertable<TData extends object> {
  insert(args: InsertArgs<TData>): Promise<TData>
  insertMany(args: InsertManyArgs<TData>): Promise<Array<TData>>
}

export type LeftJoinArgs<
  TLeftData extends object,
  TRightData extends object,
> = {
  on: {
    [K in keyof TLeftData]?: keyof TRightData
  }
  where?: WhereBuilder<TRightData> | RawWhere<TRightData>
}

export interface Joinable<TLeftData extends object> {
  leftJoin<
    TRightData extends object = object,
    TRightSchema extends TableSchema<TRightData> = TableSchema<TRightData>,
  >(
    rightTable: TRightSchema | string,
    args: LeftJoinArgs<TLeftData, InferTable<TRightSchema>>,
  ): JoinedTable<TLeftData, InferTable<TRightSchema>>
}

export interface TableBase<TData extends object>
  extends Queryable<TData>,
    Updatable<TData>,
    Deletable<TData>,
    Insertable<TData> {}

export interface Table<TData extends object>
  extends TableBase<TData>,
    Joinable<TData> {}

export interface JoinedTable<
  TLeftData extends object,
  TRightData extends object,
> extends TableBase<TLeftData> {}

export const columnTypes = ['string', 'number', 'boolean'] as const
export type ColumnType = (typeof columnTypes)[number]

export type CreateTableArgs<TData extends object> = {
  name: string
  schema: {
    [K in keyof TData]: ColumnType
  }
  primaryKey: keyof TData
}

export type CreateIndexArgs<TData extends object> = {
  keyPath: keyof TData
  unique?: boolean
}

export interface Transaction {
  table<
    TData extends object = object,
    TSchema extends TableSchema<TData> = TableSchema<TData>,
  >(
    table: TSchema | string,
  ): Table<InferTable<TSchema>>
}

export interface UpgradeTable<TData extends object> extends Table<TData> {
  createIndex(args: CreateIndexArgs<TData>): Promise<void>
}

export interface UpgradeTransaction extends Transaction {
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

export type UpgradeFunction = (
  transaction: UpgradeTransaction,
  newVersion: number,
  oldVersion: number,
) => Promise<void>

export interface Database {
  open(
    databaseName: string,
    version: number,
    upgrade: UpgradeFunction,
  ): Promise<void>
  close(): Promise<void>
  delete(databaseName: string): Promise<void>
  // shorthand for withReadTransaction
  withTransaction<TResult>(
    tables: Array<TableSchema<object>> | Array<string>,
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult>
  // runs the block with a readwrite transaction
  withWriteTransaction<TResult>(
    tables: Array<TableSchema<object>> | Array<string>,
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult>
  // runs the block with a readonly transaction
  withReadTransaction<TResult>(
    tables: Array<TableSchema<object>> | Array<string>,
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult>
  getDatabases(): Promise<Array<DatabaseInfo>>
  getTableNames(): Promise<Array<string>>
  getTableIndexNames(tableName: string): Promise<Array<string>>
}
