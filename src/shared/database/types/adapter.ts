import type { Nullable } from '@shared/lib/utils/types'
import type { OrderByDirection } from '@shared/database/types/database'
import type { RawWhere, TableSchemaRaw } from '@shared/database/types/schema'

export type DatabaseInfo = {
  name: string
  version: number
}

export interface DatabaseCursor<TData extends object> {
  value(): Nullable<TData>
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

export type AdapterBaseQueryProps<TData extends object> = HasLimitAndOffset &
  HasWhere

export type AdapterSelectProps<TData extends object> =
  AdapterBaseQueryProps<TData>

// TODO: Update should only accept a where clause
export type AdapterUpdateProps<TData extends object> =
  AdapterBaseQueryProps<TData> & {
    data: Partial<TData>
  }

// TODO: Delete should only accept a where clause
export type AdapterDeleteProps<TData extends object> =
  AdapterBaseQueryProps<TData>

export type AdapterInsertProps<TData extends object> = {
  data: TData
}

export type AdapterInsertManyProps<TData extends object> = {
  data: Array<TData>
}

export interface QueryableTableAdapter<TData extends object> {
  select(props: AdapterSelectProps<TData>): Promise<Array<TData>>
  update(props: AdapterUpdateProps<TData>): Promise<Array<TData>>
  delete(props: AdapterDeleteProps<TData>): Promise<void>
  deleteAll(): Promise<void>
  insert(props: AdapterInsertProps<TData>): Promise<TData>
  insertMany(props: AdapterInsertManyProps<TData>): Promise<Array<TData>>
}

export interface JoinableTableAdapter<TLeftData extends object> {
  leftJoin<TRightData extends object>(
    rightTableName: string,
    leftTableColumn: string,
    rightTableColumn: string,
  ): JoinedTableAdapter<TLeftData, TRightData>
}

export interface TableAdapter<TData extends object>
  extends QueryableTableAdapter<TData>,
    JoinableTableAdapter<TData> {}

export interface JoinedTableAdapter<
  TLeftData extends object,
  TRightData extends object,
> extends QueryableTableAdapter<TLeftData> {}

export type DatabaseTransactionMode = 'readwrite' | 'readonly' | 'versionchange'

export interface SchemaAdapter {
  getTable<TData extends object>(tableName: string): TableAdapter<TData>
  createTable<TData extends object>(
    schema: TableSchemaRaw<TData>,
  ): Promise<void>
  deleteTable(tableName: string): Promise<void>
}

export interface TransactionAdapter extends SchemaAdapter {
  commit(): Promise<void>
  rollback(): Promise<void>
}

export interface DatabaseAdapter {
  readonly isOpen: boolean

  // returns a transaction when the database needs to be upgraded, otherwise returns null
  openDatabase(
    databaseName: string,
    version: number,
  ): Promise<Nullable<TransactionAdapter>>
  closeDatabase(): Promise<void>
  deleteDatabase(databaseName: string): Promise<void>

  // note: only one transaction can be open at a time
  openTransaction(
    tableNames: Array<string>,
    mode: DatabaseTransactionMode,
  ): Promise<TransactionAdapter>

  getDatabaseInfo(databaseName: string): Promise<Nullable<DatabaseInfo>>
  getDatabases(): Promise<Array<DatabaseInfo>>

  getTableNames(): Promise<Array<string>>
  getTableIndexNames(tableName: string): Promise<Array<string>>
}
