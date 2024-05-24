import type { Nullable } from '@shared/lib/utils/types'
import type { OrderByDirection } from '@shared/database/types/database'
import type {
  AlterTableAction,
  RawWhere,
  TableSchemaRaw,
} from '@shared/database/types/schema'

export type DatabaseInfo = {
  version: number
}

export interface DatabaseCursor<TRow extends object> {
  value(): Nullable<TRow>
  update(data: Partial<TData>): Promise<void>
  delete(): Promise<void>
  continue(): Promise<void>
  close(): void
}

type HasOrder = {
  orderByTable: Nullable<string>
  orderByColumn: Nullable<string>
  oderByDirection: OrderByDirection
}

type HasLimitAndOffset = HasOrder & {
  limit: Nullable<number>
  offset: Nullable<number>
}

type HasWhere = {
  where: Nullable<RawWhere>
}

export type AdapterBaseQueryProps = HasLimitAndOffset & HasWhere

export type AdapterSelectProps<TRow extends object> = AdapterBaseQueryProps

export type AdapterUpdateProps<TRow extends object> = HasWhere & {
  data: Partial<TRow>
}

export type AdapterDeleteProps<TRow extends object> = HasWhere

export type AdapterInsertProps<TRow extends object> = {
  data: TRow
}

export type AdapterInsertManyProps<TRow extends object> = {
  data: Array<TRow>
}

export interface QueryableTableAdapter<TRow extends object> {
  select(props: AdapterSelectProps<TRow>): Promise<Array<TRow>>
  update(props: AdapterUpdateProps<TRow>): Promise<Array<TRow>>
  delete(props: AdapterDeleteProps<TRow>): Promise<void>
  deleteAll(): Promise<void>
  insert(props: AdapterInsertProps<TRow>): Promise<TRow>
  insertMany(props: AdapterInsertManyProps<TRow>): Promise<Array<TRow>>
}

export interface TableAdapter<TData extends object>
  extends QueryableTableAdapter<TData> {}

export interface TableAdapterFactory {
  getTable<TData extends object>(tableName: string): TableAdapter<TData>
}

export interface TransactionAdapter extends TableAdapterFactory {
  createTable<TData extends object>(
    schema: TableSchemaRaw<TData>,
  ): Promise<void>
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
   * @throws IllegalStateError If no database is open.
   */
  closeDatabase(): Promise<void>
  /***
   * Get a transaction that can be used to migrate the database to the target version.
   * Depending on the database system this may close and reopen the database.
   * @param targetVersion The version to migrate to.
   * @throws IllegalStateError If no database is open.
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
