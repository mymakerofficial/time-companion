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
import {
  DatabaseDuplicateTableError,
  DatabaseInvalidTransactionError,
  DatabaseUndefinedTableError,
} from '@shared/database/types/errors'
import { promisedRequest } from '@shared/database/adapters/indexedDB/helpers/promisedRequest'
import { toArray } from '@shared/lib/utils/list'
import { openCursor } from '@shared/database/adapters/indexedDB/helpers/openCursor'
import { cursorIterator } from '@shared/database/helpers/cursorIterator'

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
          objectStore.createIndex(column.columnName, column.columnName)
          // normally we would set unique here, but we check for unique violations ourselves
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

  async alterTable(
    tableName: string,
    actions: Array<AlterTableAction>,
  ): Promise<void> {
    check(
      this.mode === 'versionchange',
      () => new DatabaseInvalidTransactionError(),
    )

    for await (const action of actions) {
      switch (action.type) {
        case 'addColumn':
          todo()
        case 'alterColumn':
          todo()
        case 'dropColumn':
          await this.dropColumn(tableName, action.columnName)
          break
        case 'renameColumn':
          await this.renameColumn(
            tableName,
            action.columnName,
            action.newColumnName,
          )
          break
        case 'renameTable':
          await this.renameTable(tableName, action.newTableName)
          break
      }
    }
  }

  protected async dropColumn(
    tableName: string,
    columnName: string,
  ): Promise<void> {
    check(
      this.db.objectStoreNames.contains(tableName),
      () => new DatabaseUndefinedTableError(tableName),
    )

    const objectStore = this.tx.objectStore(tableName)

    const iterator = cursorIterator(await openCursor(objectStore))

    for await (const cursor of iterator) {
      const newValue = { ...cursor.value }
      delete newValue[columnName as keyof object]

      await cursor.update(newValue)
    }
  }

  protected async renameColumn(
    tableName: string,
    oldColumnName: string,
    newColumnName: string,
  ): Promise<void> {
    check(
      this.db.objectStoreNames.contains(tableName),
      () => new DatabaseUndefinedTableError(tableName),
    )

    // we can't check if the old column exists, but id like to

    const objectStore = this.tx.objectStore(tableName)

    const iterator = cursorIterator(await openCursor(objectStore))

    for await (const cursor of iterator) {
      const newValue = {
        ...cursor.value,
        [newColumnName]: cursor.value[oldColumnName as keyof object], // lol
      }
      delete newValue[oldColumnName]

      await cursor.update(newValue)
    }
  }

  protected async renameTable(oldName: string, newName: string): Promise<void> {
    check(
      this.db.objectStoreNames.contains(oldName),
      () => new DatabaseUndefinedTableError(oldName),
    )

    check(
      !this.db.objectStoreNames.contains(newName),
      () => new DatabaseDuplicateTableError(newName),
    )

    const oldObjectStore = this.tx.objectStore(oldName)

    this.db.createObjectStore(newName, {
      keyPath: oldObjectStore.keyPath,
    })

    const newObjectStore = this.tx.objectStore(newName)

    // copy all indexes
    toArray(oldObjectStore.indexNames).forEach((indexName) => {
      const index = oldObjectStore.index(indexName)
      newObjectStore.createIndex(index.name, index.keyPath)
    })

    // copy all rows
    //  we use a cursor, so we don't have to load all rows into memory

    const cursor = await openCursor(oldObjectStore)
    const iterator = cursorIterator(cursor)

    for await (const { value } of iterator) {
      await promisedRequest(newObjectStore.add(value))
    }

    this.db.deleteObjectStore(oldName)
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
