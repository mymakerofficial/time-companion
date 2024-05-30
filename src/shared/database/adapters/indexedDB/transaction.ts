import type {
  TableAdapter,
  TransactionAdapter,
} from '@shared/database/types/adapter'
import { IdbTableAdapter } from '@shared/database/adapters/indexedDB/table'
import type {
  AlterTableAction,
  TableSchemaRaw,
} from '@shared/database/types/schema'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { valuesOf } from '@shared/lib/utils/object'
import { todo } from '@shared/lib/utils/todo'
import { DatabaseInvalidTransactionError } from '@shared/database/types/errors'

export class IdbDatabaseTransactionAdapter implements TransactionAdapter {
  constructor(
    protected readonly db: IDBDatabase,
    protected readonly tx: IDBTransaction,
    protected readonly mode: IDBTransactionMode,
  ) {}

  getTable<TRow extends object>(
    tableName: string,
    tableSchema?: TableSchemaRaw<TRow>,
  ): TableAdapter<TRow> {
    return new IdbTableAdapter<TRow>(this.tx, tableName, tableSchema)
  }

  createTable<TRow extends object>(
    schema: TableSchemaRaw<TRow>,
  ): Promise<void> {
    return new Promise((resolve) => {
      check(
        this.mode === 'versionchange',
        () => new DatabaseInvalidTransactionError(),
      )

      const objectStore = this.db.createObjectStore(schema.tableName, {
        keyPath: schema.primaryKey,
        autoIncrement: false,
      })

      valuesOf(schema.columns).forEach((column) => {
        check(isNotNull(column.columnName), 'Column name may not be null')

        if (column.isIndexed) {
          objectStore.createIndex(column.columnName, column.columnName, {
            unique: column.isUnique,
          })
        }
      })

      // the object store is created synchronously, so we can resolve immediately
      resolve()
    })
  }

  dropTable(tableName: string): Promise<void> {
    return new Promise((resolve) => {
      check(
        this.mode === 'versionchange',
        () => new DatabaseInvalidTransactionError(),
      )

      this.db.deleteObjectStore(tableName)

      // the object store is deleted synchronously, so we can resolve immediately
      resolve()
    })
  }

  alterTable(
    tableName: string,
    actions: Array<AlterTableAction>,
  ): Promise<void> {
    todo()
  }

  commit(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.mode !== 'versionchange') {
        // explicitly calling commit on a versionchange transaction
        //  will cause the transaction to never complete
        //  this is also only an issue in the browser
        this.tx.commit()
      }
      // wait for the transaction to actually complete
      this.tx.oncomplete = () => {
        resolve()
      }
      this.tx.onerror = () => {
        reject(this.tx.error)
      }
    })
  }

  rollback(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.tx.abort()
      this.tx.onabort = () => {
        resolve()
      }
      this.tx.onerror = () => {
        reject(this.tx.error)
      }
    })
  }
}
