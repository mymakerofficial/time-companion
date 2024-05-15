import type {
  SchemaAdapter,
  TableAdapter,
} from '@shared/database/types/adapter'
import { IdbTableAdapter } from '@shared/database/adapters/indexedDB/table'
import type { TableSchemaRaw } from '@shared/database/types/schema'
import { check } from '@shared/lib/utils/checks'
import { valuesOf } from '@shared/lib/utils/object'

export class IdbSchemaAdapter implements SchemaAdapter {
  constructor(
    protected readonly db: IDBDatabase,
    protected readonly tx: IDBTransaction,
    protected readonly mode: IDBTransactionMode,
  ) {}

  getTable<TData extends object>(tableName: string): TableAdapter<TData> {
    const objectStore = this.tx.objectStore(tableName)
    return new IdbTableAdapter<TData>(objectStore)
  }

  createTable<TData extends object>(
    schema: TableSchemaRaw<TData>,
  ): Promise<void> {
    return new Promise((resolve) => {
      check(
        this.mode === 'versionchange',
        'Transaction is not a versionchange transaction.',
      )

      const objectStore = this.db.createObjectStore(schema.tableName, {
        keyPath: schema.primaryKey,
        autoIncrement: false,
      })

      valuesOf(schema.columns).forEach((column) => {
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

  deleteTable(tableName: string): Promise<void> {
    return new Promise((resolve) => {
      check(
        this.mode === 'versionchange',
        'Transaction is not a versionchange transaction.',
      )

      this.db.deleteObjectStore(tableName)

      // the object store is deleted synchronously, so we can resolve immediately
      resolve()
    })
  }
}
