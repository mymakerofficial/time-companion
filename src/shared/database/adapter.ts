import type { Nullable } from '@shared/lib/utils/types'
import type { UpgradeFunction } from '@shared/database/database'

export type DatabaseInfo = {
  name: string
  version: number
}

export interface DatabaseCursor<TData extends object> {
  value(): Nullable<TData>
  update(data: Partial<TData>): void
  delete(): void
  continue(): Promise<void>
  close(): void
}

export type DatabaseCursorDirection = 'next' | 'prev'

export interface DatabaseTableAdapter<TData extends object> {
  insert(data: TData): Promise<void>
  deleteAll(): Promise<void>
  // note: opening a cursor locks the table until the cursor is closed
  openCursor(
    indexName: Nullable<string>,
    direction: DatabaseCursorDirection,
  ): Promise<DatabaseCursor<TData>>

  createIndex(keyPath: string, unique: boolean): Promise<void>
  getIndexNames(): Promise<Array<string>>
}

export type DatabaseTransactionMode = 'readwrite' | 'readonly' | 'versionchange'

export interface DatabaseTransactionAdapter {
  getTable<TData extends object>(tableName: string): DatabaseTableAdapter<TData>

  // note: a table can only be created in a versionchange transaction
  createTable(tableName: string, primaryKey: string): Promise<void>
  // note: a table can only be deleted in a versionchange transaction
  deleteTable(tableName: string): Promise<void>

  // note: a transaction can not be committed while a table is locked
  commit(): Promise<void>
  rollback(): Promise<void>
}

export interface DatabaseAdapter {
  // returns a transaction when the database needs to be upgraded, otherwise returns null
  openDatabase(
    databaseName: string,
    version: number,
  ): Promise<Nullable<DatabaseTransactionAdapter>>
  closeDatabase(): Promise<void>
  deleteDatabase(databaseName: string): Promise<void>

  // note: only one transaction can be open at a time
  openTransaction(
    tableNames: Array<string>,
    mode: DatabaseTransactionMode,
  ): Promise<DatabaseTransactionAdapter>

  getDatabaseInfo(databaseName: string): Promise<Nullable<DatabaseInfo>>
  getDatabases(): Promise<Array<DatabaseInfo>>

  getTableNames(): Promise<Array<string>>
  getTableIndexNames(tableName: string): Promise<Array<string>>
}
