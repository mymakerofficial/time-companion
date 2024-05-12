import type { Nullable } from '@shared/lib/utils/types'
import type {
  ColumnType,
  DeleteArgs,
  DeleteManyArgs,
  FindArgs,
  FindManyArgs,
  InsertArgs,
  InsertManyArgs,
  OrderBy,
  OrderByDirection,
  UpdateArgs,
  UpdateManyArgs,
} from '@shared/database/types/database'
import type {
  InferTable,
  RawWhere,
  TableSchema,
  TableSchemaRaw,
  WhereBuilder,
} from '@shared/database/types/schema'

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

export type AdapterSelectOptions<TData extends object> = HasLimitAndOffset &
  HasWhere

export type AdapterUpdateOptions<TData extends object> = HasLimitAndOffset &
  HasWhere & {
    data: Partial<TData>
  }

export type AdapterDeleteOptions<TData extends object> =
  AdapterSelectOptions<TData>

export type AdapterInsertOptions<TData extends object> = {
  data: TData
}

export type AdapterInsertManyOptions<TData extends object> = {
  data: Array<TData>
}

export interface TableBaseAdapter<TData extends object> {
  select(options: AdapterSelectOptions<TData>): Promise<Array<TData>>
  update(options: AdapterUpdateOptions<TData>): Promise<Array<TData>>
  delete(options: AdapterDeleteOptions<TData>): Promise<void>
  deleteAll(): Promise<void>
  insert(options: AdapterInsertOptions<TData>): Promise<TData>
  insertMany(options: AdapterInsertManyOptions<TData>): Promise<Array<TData>>
}

export interface TableJoinAdapter<TLeftData extends object> {
  leftJoin<TRightData extends object>(
    rightTableName: string,
    leftTableColumn: string,
    rightTableColumn: string,
  ): JoinedTableAdapter<TLeftData, TRightData>
}

export interface TableAdapter<TData extends object>
  extends TableBaseAdapter<TData>,
    TableJoinAdapter<TData> {}

export interface JoinedTableAdapter<
  TLeftData extends object,
  TRightData extends object,
> extends TableBaseAdapter<TLeftData> {}

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
