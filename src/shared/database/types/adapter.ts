import type { Nullable } from '@shared/lib/utils/types'
import type { KeyRange, OrderBy } from '@shared/database/types/database'
import type {
  AlterTableAction,
  RawWhere,
  TableSchemaRaw,
} from '@shared/database/types/schema'

export type DatabaseInfo = {
  version: number
}

type HasOrder = {
  orderBy: Nullable<OrderBy>
}

type HasLimitAndOffset = HasOrder & {
  limit: Nullable<number>
  offset: Nullable<number>
}

type HasWhereAndRange = {
  where: Nullable<RawWhere>
  range: Nullable<KeyRange>
}

export type AdapterBaseQueryProps = HasLimitAndOffset & HasWhereAndRange

export type AdapterSelectProps<TRow extends object> = AdapterBaseQueryProps

export type AdapterUpdateProps<TRow extends object> = HasWhereAndRange & {
  data: Partial<TRow>
}

export type AdapterDeleteProps<TRow extends object> = HasWhereAndRange

export type AdapterInsertProps<TRow extends object> = {
  data: TRow
}

export type AdapterInsertManyProps<TRow extends object> = {
  data: Array<TRow>
}

export interface TableAdapter<TRow extends object> {
  select(props: AdapterSelectProps<TRow>): Promise<Array<TRow>>
  update(props: AdapterUpdateProps<TRow>): Promise<Array<TRow>>
  delete(props: AdapterDeleteProps<TRow>): Promise<void>
  deleteAll(): Promise<void>
  insert(props: AdapterInsertProps<TRow>): Promise<TRow>
  insertMany(props: AdapterInsertManyProps<TRow>): Promise<Array<TRow>>
}

export interface TableAdapterFactory {
  /***
   * Returns a table adapter for the given table.
   * **This method should never throw.** All errors should be thrown in the following async methods.
   */
  getTable<TRow extends object>(
    tableName: string,
    tableSchema?: TableSchemaRaw<TRow>,
  ): TableAdapter<TRow>
}

export interface TransactionAdapter extends TableAdapterFactory {
  createTable<TRow extends object>(schema: TableSchemaRaw<TRow>): Promise<void>
  dropTable(tableName: string): Promise<void>
  alterTable(tableName: string, actions: Array<AlterTableAction>): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>
}

export interface DatabaseAdapter extends TableAdapterFactory {
  readonly isOpen: boolean

  /***
   * Opens the database at the current version without any migrations.
   * If the database does not exist, it will be created at version 1.
   */
  openDatabase(): Promise<DatabaseInfo>
  /***
   * Closes the currently open database.
   */
  closeDatabase(): Promise<void>
  /***
   * Drops the database schema, removing all data and resetting the version to 1.
   */
  dropSchema(): Promise<void>
  /***
   * Get a transaction that can be used to migrate the database to the target version.
   * Depending on the database system this may close and reopen the database.
   * @param targetVersion The version to migrate to.
   */
  openMigration(targetVersion: number): Promise<TransactionAdapter>
  /***
   * Opens a new transaction.
   * **Note: Only one transaction can be open at a time, and it must be committed or rolled back by the caller.**
   * @returns A transaction adapter that can be used to interact with the database.
   */
  openTransaction(): Promise<TransactionAdapter>
  /***
   * Gets information about the database.
   * @returns The database info, or `null` if the database does not yet exist.
   */
  getDatabaseInfo(): Promise<Nullable<DatabaseInfo>>
  /***
   * Gets the names of all tables in the database.
   * @returns The names of all tables in the database.
   */
  getTableNames(): Promise<Array<string>>
}
