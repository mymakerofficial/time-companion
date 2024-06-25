import type { Nullable } from '@shared/lib/utils/types'
import type {
  AlterTableBuilder,
  ColumnBuilder,
  ColumnDefinitionRaw,
  DatabaseSchema,
  InferTable,
  TableSchema,
  TableSchemaRaw,
  WhereBuilderOrRaw,
} from '@database/types/schema'
import type { SubscriberCallback } from '@shared/events/publisher'

export const whereBooleanOperators = ['and', 'or'] as const
export type WhereBooleanOperator = (typeof whereBooleanOperators)[number]

export const whereOperators = [
  ...['equals', 'notEquals'],
  ...['contains', 'notContains'],
  ...['inArray', 'notInArray'],
  ...['lessThan', 'lessThanOrEquals', 'greaterThan', 'greaterThanOrEquals'],
] as const
export type WhereOperator = (typeof whereOperators)[number]

export const orderByDirections = ['asc', 'desc'] as const
export type OrderByDirection = (typeof orderByDirections)[number]

export const columnTypes = [
  'text',
  'integer',
  'double',
  'boolean',
  'datetime',
  'date',
  'time',
  'interval',
  'uuid',
  'json',
] as const
export type ColumnType = (typeof columnTypes)[number]

export type OrderBy<TRow extends object = object, TColumn = unknown> = {
  column: ColumnDefinitionRaw<TRow, TColumn>
  direction: OrderByDirection
}

export type KeyRange<TRow extends object = object, TColumn = unknown> = {
  column: ColumnDefinitionRaw<TRow, TColumn>
  lower?: TColumn
  lowerOpen: boolean
  upper?: TColumn
  upperOpen: boolean
}

export type FindProps<TRow extends object, TReturn extends object = TRow> = {
  range?: KeyRange<TRow>
  where?: WhereBuilderOrRaw<TRow>
  orderBy?: OrderBy<TRow>
  map?: (row: TRow) => TReturn
}

export type FindManyProps<
  TRow extends object,
  TReturn extends object = TRow,
> = {
  range?: KeyRange<TRow>
  where?: WhereBuilderOrRaw<TRow>
  orderBy?: OrderBy<TRow>
  offset?: number
  limit?: number
  map?: (row: TRow) => TReturn
}

export type UpdateProps<TRow extends object, TReturn extends object = TRow> = {
  range?: KeyRange<TRow>
  where?: WhereBuilderOrRaw<TRow>
  data: Partial<TRow>
  map?: (row: TRow) => TReturn
}

export type DeleteProps<TRow extends object> = {
  range?: KeyRange<TRow>
  where?: WhereBuilderOrRaw<TRow>
}

export type InsertProps<TRow extends object, TReturn extends object = TRow> = {
  data: TRow
  map?: (row: TRow) => TReturn
}

export type InsertManyProps<
  TRow extends object,
  TReturn extends object = TRow,
> = {
  data: Array<TRow>
  map?: (row: TRow) => TReturn
}

export interface Table<TRow extends object> {
  findFirst<TReturn extends object = TRow>(
    props?: FindProps<TRow, TReturn>,
  ): Promise<Nullable<TReturn>>
  findMany<TReturn extends object = TRow>(
    props?: FindManyProps<TRow, TReturn>,
  ): Promise<Array<TReturn>>
  update<TReturn extends object = TRow>(
    props: UpdateProps<TRow, TReturn>,
  ): Promise<Array<TReturn>>
  delete(props: DeleteProps<TRow>): Promise<void>
  deleteAll(): Promise<void>
  insert<TReturn extends object = TRow>(
    props: InsertProps<TRow, TReturn>,
  ): Promise<TReturn>
  insertMany<TReturn extends object = TRow>(
    props: InsertManyProps<TRow, TReturn>,
  ): Promise<Array<TReturn>>
  getColumnNames(): Array<string>
}

export interface QueryFactory {
  /***
   * Used to access the table for performing operations on it.
   * You can either pass the table schema to infer all types automatically,
   * or pass the table name as a string and optionally provide the types manually.
   * @param table The table schema or name.
   * @returns The table.
   */
  table<
    TRow extends object = object,
    TSchema extends TableSchema<TRow> = TableSchema<TRow>,
  >(
    table: TSchema | string,
  ): Table<InferTable<TSchema>>
}

export interface Transaction extends QueryFactory {}

export interface UpgradeTransaction extends Transaction {
  /***
   * Immediately creates a table in the transaction.
   * @param tableName The name of the table.
   *
   *  **Note:** Table names may not start and end with an underscore.
   * @param columns The columns of the table.
   * @example
   * ```typescript
   * await transaction.createTable('table', {
   *  id: t.uuid().primaryKey(),
   *  name: t.string().nullable(),
   *  age: t.number(),
   *  email: t.string().indexed().unique(),
   * })
   *```
   */
  createTable<TRow extends object>(
    tableName: string,
    columns: {
      [K in keyof TRow]: ColumnBuilder<TRow[K]>
    },
  ): Promise<void>
  /***
   * Immediately drops a table in the transaction.
   * @param tableName The name of the table to drop.
   */
  dropTable(tableName: string): Promise<void>
  /***
   * Alters a table.
   *
   * **Note:** All alterations are executed together after the block has finished.
   * @param tableName The name of the table to alter.
   * @param block The block used to build the alterations.
   *
   * @example
   * ```typescript
   * await transaction.alterTable('table', (table) => {
   *  table.renameTo('newTable')
   *  table.addColumn('newColumn').string().nullable()
   *  table.dropColumn('oldColumn')
   *  table.renameColumn('email', 'emailAddress')
   *  table
   *    .alterColumn('emailAddress')
   *    .setDataType('string')
   *    .dropNullable()
   *    .setIndexed()
   *    .setUnique()
   *})
   *```
   */
  alterTable(
    tableName: string,
    block: (table: AlterTableBuilder) => void,
  ): Promise<void>
}

export type DatabasePublisherTopics = {
  type:
    | 'migrationsStarted'
    | 'migrationsSkipped'
    | 'migrationsFinished'
    | 'migrationFailed'
}

export type DatabasePublisherEvent = {}

export interface UnsafeDatabase<TSchema extends DatabaseSchema = {}> {
  /*
   * Drops the database schema, removing all tables, all data and resetting the version to 0.
   * Use {@link migrate} to recreate the database schema.
   * **This is not recommended for production use!**
   */
  dropSchema(): Promise<void>
  /***
   * Migrates the database to the newest version. Behaves like `open` but expects the database to already be open.
   * **This is not recommended for production use!**
   */
  migrate(): Promise<void>
  /***
   * Adds a single migration and immediately runs it.
   * **This is not recommended for production use!**
   */
  runMigration(migrationFn: MigrationFunction): Promise<void>
  /***
   * Set the migrations to be used by the database when migrating.
   * See {@link migrate} to run migrations after the database is opened.
   * **This is not recommended for production use!**
   */
  setMigrations(migrations: DatabaseConfig<TSchema>['migrations']): void
  /***
   * Set the schema.
   */
  setConfigSchema(
    schema: DatabaseConfig<DatabaseSchema>['schema'] | undefined,
  ): void
  /***
   * Get a deep clone of the current internal schema built up during the migrations.
   */
  getRuntimeSchema(): Map<string, TableSchemaRaw>
}

export interface Database<TSchema extends DatabaseSchema = {}>
  extends QueryFactory {
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
   * Gets the names of all tables.
   */
  getTableNames(): Array<string>
  /***
   * Gets the names of all tables that currently exist in the database.
   * **Note**: this might be out of sync with the provided schema.
   */
  getActualTableNames(): Promise<Array<string>>

  /***
   * Gain access to unsafe database operations.
   * **This is not recommended for production use!**
   */
  readonly unsafe: UnsafeDatabase<TSchema>

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
