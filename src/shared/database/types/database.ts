import type { Nullable } from '@shared/lib/utils/types'
import type {
  ColumnBuilder,
  ColumnDefinitionRaw,
  DatabaseSchema,
  InferTable,
  TableSchema,
  WhereBuilderOrRaw,
} from '@shared/database/types/schema'
import type { SubscriberCallback } from '@shared/events/publisher'

export const whereBooleanOperators = ['and', 'or'] as const
export type WhereBooleanOperator = (typeof whereBooleanOperators)[number]

export const whereEqualityOperators = ['equals', 'notEquals'] as const
export type WhereEqualityOperator = (typeof whereEqualityOperators)[number]

export const whereStringOperators = ['contains', 'notContains'] as const
export type WhereStringOperator = (typeof whereStringOperators)[number]

export const whereListOperators = ['inArray', 'notInArray'] as const
export type WhereListOperator = (typeof whereListOperators)[number]

export const whereNumberOperators = [
  'lessThan',
  'lessThanOrEquals',
  'greaterThan',
  'greaterThanOrEquals',
] as const
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

export const columnTypes = [
  'string',
  'number',
  'boolean',
  'uuid',
  'double',
  'integer',
  'json',
] as const
export type ColumnType = (typeof columnTypes)[number]

export interface TableFactory {
  /***
   * Used to access the table for performing operations on it.
   * You can either pass the table schema to infer all types automatically,
   * or pass the table name as a string and optionally provide the types manually.
   * @param table The table schema or name.
   * @returns The table.
   */
  table<
    TData extends object = object,
    TSchema extends TableSchema<TData> = TableSchema<TData>,
  >(
    table: TSchema | string,
  ): Table<InferTable<TSchema>>
}

export interface Transaction extends TableFactory {}

export interface UpgradeTransaction extends Transaction {
  createTable<TRow extends object>(
    tableName: string,
    columns: {
      [K in keyof TRow]: ColumnBuilder<TRow[K]>
    },
  ): Promise<TableSchema<TRow>>
  dropTable(tableName: string): Promise<void>
}

export type DatabasePublisherTopics = {
  type:
    | 'migrationsStarted'
    | 'migrationsSkipped'
    | 'migrationsFinished'
    | 'migrationFailed'
}

export type DatabasePublisherEvent = {}

export interface Database<TSchema extends DatabaseSchema = {}>
  extends TableFactory {
  readonly isOpen: boolean
  readonly version: number

  /***
   * Opens the database and migrates it to the newest version.
   */
  open(): Promise<void>
  /***
   * Closes the database.
   */
  close(): Promise<void>
  /***
   * Runs the provided block inside a transaction and commits it if successful, or rolls it back if an error occurs.
   * @param block The block to run inside the transaction.
   * @returns The result of the block.
   */
  withTransaction<TResult>(
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult>
  /***
   * @deprecated will be removed in the future in favor of getting the schema
   */
  getTableNames(): Promise<Array<string>>

  /***
   * Registers a callback to be called when the migrations are started.
   */
  onMigrationsStarted(
    callback: SubscriberCallback<
      DatabasePublisherTopics,
      DatabasePublisherEvent
    >,
  ): void
  /***
   * Registers a callback to be called when the migrations are skipped.
   */
  onMigrationsSkipped(
    callback: SubscriberCallback<
      DatabasePublisherTopics,
      DatabasePublisherEvent
    >,
  ): void
  /***
   * Registers a callback to be called when the migrations are finished.
   */
  onMigrationsFinished(
    callback: SubscriberCallback<
      DatabasePublisherTopics,
      DatabasePublisherEvent
    >,
  ): void
  /***
   * Registers a callback to be called when a migration fails.
   */
  onMigrationsFailed(
    callback: SubscriberCallback<
      DatabasePublisherTopics,
      DatabasePublisherEvent
    >,
  ): void
}

export type MigrationFunction = (
  transaction: UpgradeTransaction,
) => Promise<void>

export type DatabaseConfig<TSchema extends DatabaseSchema> = {
  migrations: Array<
    | (() => Promise<{
        default: MigrationFunction
      }>)
    | MigrationFunction
  >
  schema?: {
    [K in keyof TSchema]: TableSchema<TSchema[K]>
  }
}
