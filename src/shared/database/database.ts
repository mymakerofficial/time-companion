import type { DatabaseInfo } from '@shared/database/adapter'
import type { Nullable } from '@shared/lib/utils/types'

export const whereBooleanOperators = ['AND', 'OR'] as const
export type WhereBooleanOperator = (typeof whereBooleanOperators)[number]

export const whereEqualityOperators = ['equals', 'notEquals'] as const
export type WhereEqualityOperator = (typeof whereEqualityOperators)[number]

export const whereStringOperators = ['contains', 'notContains'] as const
export type WhereStringOperator = (typeof whereStringOperators)[number]

export const whereListOperators = ['in', 'notIn'] as const
export type WhereListOperator = (typeof whereListOperators)[number]

export const whereNumberOperators = ['lt', 'lte', 'gt', 'gte'] as const
export type WhereNumberOperator = (typeof whereNumberOperators)[number]

export const whereOperators = [
  ...whereEqualityOperators,
  ...whereStringOperators,
  ...whereListOperators,
  ...whereNumberOperators,
] as const

export type WhereOperator = (typeof whereOperators)[number]

export type WhereInput<TData extends object> = {
  [O in WhereBooleanOperator]?: Array<WhereInput<TData>>
} & {
  [K in keyof TData]?: {
    [O in WhereEqualityOperator]?: TData[K]
  } & {
    [O in WhereStringOperator]?: string
  } & {
    [O in WhereListOperator]?: Array<TData[K]>
  } & {
    [O in WhereNumberOperator]?: number
  }
}

const orderDirections = ['asc', 'desc'] as const
export type OrderByDirection = (typeof orderDirections)[number]

type HasOrder<TData extends object> = {
  orderBy?: OrderByInput<TData>
}

type HasOffset<TData extends object> = HasOrder<TData> & {
  offset?: number
}

type HasLimit<TData extends object> = HasOrder<TData> & {
  limit?: number
}

export type OrderByInput<TData extends object> = {
  [K in keyof TData]?: OrderByDirection
}

export type InsertArgs<TData extends object> = {
  data: TData
}

export type InsertManyArgs<TData extends object> = {
  data: Array<TData>
}

export type FindArgs<TData extends object> = HasOffset<TData> & {
  where?: WhereInput<TData>
}

export type FindManyArgs<TData extends object> = FindArgs<TData> &
  HasLimit<TData>

export type UpdateArgs<TData extends object> = HasOffset<TData> & {
  where?: WhereInput<TData>
  data: Partial<TData>
}

export type UpdateManyArgs<TData extends object> = UpdateArgs<TData> &
  HasLimit<TData>

export type DeleteArgs<TData extends object> = HasOffset<TData> & {
  where?: WhereInput<TData>
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
  where?: WhereInput<TRightData>
}

export interface Joinable<TLeftData extends object> {
  leftJoin<TRightData extends object>(
    rightTableName: string,
    args: LeftJoinArgs<TLeftData, TRightData>,
  ): JoinedTable<TLeftData, TRightData>
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
  table<TData extends object>(tableName: string): Table<TData>
}

export interface UpgradeTable<TData extends object> extends Table<TData> {
  createIndex(args: CreateIndexArgs<TData>): Promise<void>
}

export interface UpgradeTransaction extends Transaction {
  createTable<TData extends object>(
    args: CreateTableArgs<TData>,
  ): Promise<UpgradeTable<TData>>
  table<TData extends object>(tableName: string): UpgradeTable<TData>
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
  withTransaction<TResult>(
    fn: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult>
  getDatabases(): Promise<Array<DatabaseInfo>>
  getTableNames(): Promise<Array<string>>
  getTableIndexNames(tableName: string): Promise<Array<string>>
}
