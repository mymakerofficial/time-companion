import type { DatabaseInfo } from '@shared/database/types/adapter'
import type { Nullable } from '@shared/lib/utils/types'
import type {
  ColumnDefinitionRaw,
  InferTable,
  TableSchema,
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

export type OrderBy<TRow extends object, TColumn = unknown> = {
  column: ColumnDefinitionRaw<TRow, TColumn>
  direction: OrderByDirection
}

export type FindProps<TRow extends object> = {
  where?: WhereBuilderOrRaw<TRow>
  orderBy?: OrderBy<TRow>
}

export type FindManyProps<TRow extends object> = {
  where?: WhereBuilderOrRaw<TRow>
  orderBy?: OrderBy<TRow>
  offset?: number
  limit?: number
}

export type UpdateProps<TRow extends object> = {
  where?: WhereBuilderOrRaw<TRow>
  data: Partial<TRow>
}

export type DeleteProps<TRow extends object> = {
  where?: WhereBuilderOrRaw<TRow>
}

export type InsertProps<TRow extends object> = {
  data: TRow
}

export type InsertManyProps<TRow extends object> = {
  data: Array<TRow>
}

export interface QueryableTable<TRow extends object> {
  findFirst(props?: FindProps<TRow>): Promise<Nullable<TRow>>
  findMany(props?: FindManyProps<TRow>): Promise<Array<TRow>>
  update(props: UpdateProps<TRow>): Promise<Array<TRow>>
  delete(props: DeleteProps<TRow>): Promise<void>
  deleteAll(): Promise<void>
  insert(props: InsertProps<TRow>): Promise<TRow>
  insertMany(props: InsertManyProps<TRow>): Promise<Array<TRow>>
}

export type LeftJoinProps<TLeftRow extends object, TRightRow extends object> = {
  on: WhereBuilderOrRaw<TLeftRow | TRightRow>
}

export interface JoinableTable<TLeftRow extends object> {
  leftJoin<
    TRightRow extends object = object,
    TRightSchema extends TableSchema<TRightRow> = TableSchema<TRightRow>,
  >(
    rightTable: TRightSchema | string,
    props: LeftJoinProps<TLeftRow, InferTable<TRightSchema>>,
  ): JoinedTable<TLeftRow, InferTable<TRightSchema>>
}

export interface Table<TRow extends object>
  extends QueryableTable<TRow>,
    JoinableTable<TRow> {}

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
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult>
  getDatabases(): Promise<Array<DatabaseInfo>>
  getTableNames(): Promise<Array<string>>
  getTableIndexNames(tableName: string): Promise<Array<string>>
}
