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
  openTransaction(): Promise<TransactionAdapter>

  getDatabaseInfo(databaseName: string): Promise<Nullable<DatabaseInfo>>
  getDatabases(): Promise<Array<DatabaseInfo>>

  getTableNames(): Promise<Array<string>>
  getTableIndexNames(tableName: string): Promise<Array<string>>
}
