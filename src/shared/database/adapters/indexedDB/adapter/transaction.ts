import type {
  DatabaseTableAdapter,
  DatabaseTransactionAdapter,
  DatabaseTransactionMode,
} from '@shared/database/types/adapter'
import { todo } from '@shared/lib/utils/todo'
import { check } from '@shared/lib/utils/checks'
import { IndexedDBDatabaseTableAdapterImpl } from '@shared/database/adapters/indexedDB/adapter/table'

export class IndexedDBDatabaseTransactionAdapterImpl
  implements DatabaseTransactionAdapter
{
  constructor(
    protected readonly database: IDBDatabase,
    protected readonly transaction: IDBTransaction,
    protected readonly tableNames: Array<string>,
    protected readonly mode: DatabaseTransactionMode,
  ) {}

  getTable<TData extends object>(
    tableName: string,
  ): DatabaseTableAdapter<TData> {
    const objectStore = this.transaction.objectStore(tableName)
    return new IndexedDBDatabaseTableAdapterImpl<TData>(objectStore)
  }

  createTable(tableName: string, primaryKey: string): Promise<void> {
    return new Promise((resolve) => {
      check(
        this.mode === 'versionchange',
        'Transaction is not a versionchange transaction.',
      )

      this.database.createObjectStore(tableName, {
        keyPath: primaryKey,
        autoIncrement: false,
      })

      // the object store is created synchronously, so we can resolve immediately
      resolve()
    })
  }

  deleteTable(tableName: string): Promise<void> {
    return new Promise((resolve) => {
      check(
        this.mode === 'versionchange',
        'Transaction is not a versionchange transaction.',
      )

      this.database.deleteObjectStore(tableName)

      // the object store is deleted synchronously, so we can resolve immediately
      resolve()
    })
  }

  commit(): Promise<void> {
    return new Promise((resolve) => {
      this.transaction.commit()
      resolve()
    })
  }

  rollback(): Promise<void> {
    return new Promise((resolve) => {
      this.transaction.abort()
      resolve()
    })
  }
}
