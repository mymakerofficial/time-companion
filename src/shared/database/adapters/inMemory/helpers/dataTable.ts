import { emptyMap, toArray } from '@shared/lib/utils/list'
import { check, isDefined } from '@shared/lib/utils/checks'
import { InMemoryCursorImpl } from '@shared/database/adapters/inMemory/helpers/cursor'
import type {
  DatabaseAdapterTableSchema,
  DatabaseCursor,
  DatabaseCursorDirection,
} from '@shared/database/types/adapter'
import type { DatabaseTableSchemaRaw } from '@shared/database/types/schema'

type Index<
  TData extends object,
  TPrimaryKey extends keyof TData,
  TIndexKey extends keyof TData = keyof TData,
> = {
  unique: boolean
  values: Array<{
    indexedValue: TData[TIndexKey]
    primaryKeys: Array<TData[TPrimaryKey]>
  }>
}

export interface InMemoryDataTable<TData extends object> {
  getSchema(): DatabaseAdapterTableSchema
  getPrimaryKey(): keyof TData
  getRows(): Map<TData[keyof TData], TData>
  getIndexes(): Map<keyof TData, Index<TData, keyof TData>>
  getIndexNames(): Array<string>
  createIndex(keyPath: keyof TData, unique: boolean): void
  removeIndex(keyPath: keyof TData): void
  // updates the given index with the new value.
  //  **beware: this method does not perform any checks!**
  updateRowColumnIndexing(
    primaryKeyValue: TData[keyof TData],
    keyPath: keyof TData,
    oldValue: TData[typeof keyPath],
    newValue: TData[typeof keyPath],
  ): void
  // removes the given index with the old value.
  //  **beware: this method does not perform any checks!**
  removeRowIndexing(
    primaryKeyValue: TData[keyof TData],
    keyPath: keyof TData,
    oldValue: TData[typeof keyPath],
  ): void
  insert(data: TData): void
  insertAll(data: Array<TData>): void
  // deletes all rows, keeping the indexes
  deleteAll(): void
  createCursor(
    keyPath: keyof TData,
    direction?: DatabaseCursorDirection,
  ): DatabaseCursor<TData>
}

export type InMemoryDataTables = Map<string, InMemoryDataTable<any>>

export class InMemoryDataTableImpl<TData extends object>
  implements InMemoryDataTable<TData>
{
  protected rows: Map<TData[typeof this.primaryKey], TData>
  protected indexes: Map<
    keyof TData /* keyPath */,
    Index<TData, typeof this.primaryKey>
  >

  protected locked = false

  constructor(protected readonly schema: DatabaseAdapterTableSchema) {
    this.rows = emptyMap()
    this.indexes = emptyMap()

    this.indexes.set(schema.primaryKey as keyof TData, {
      unique: true,
      values: [],
    })
  }

  protected get primaryKey() {
    return this.schema.primaryKey as keyof TData
  }

  getPrimaryKey() {
    return this.primaryKey
  }

  getSchema(): DatabaseAdapterTableSchema {
    return this.schema
  }

  getRows() {
    return this.rows
  }

  getIndexes() {
    return this.indexes
  }

  getIndexNames() {
    return toArray(this.indexes.keys())
      .map((it) => it.toString())
      .filter((it) => it !== this.primaryKey)
      .sort()
  }

  createIndex(keyPath: keyof TData, unique: boolean) {
    check(
      !this.indexes.has(keyPath),
      `Index "${keyPath.toString()}" already exists.`,
    )

    this.indexes.set(keyPath, {
      unique,
      values: [],
    })
  }

  removeIndex(keyPath: keyof TData) {
    check(
      this.indexes.has(keyPath),
      `Index "${keyPath.toString()}" does not exist.`,
    )

    this.indexes.delete(keyPath)
  }

  private insertRowColumnIndexing(
    keyPath: keyof TData,
    index: Index<TData, typeof this.primaryKey>,
    indexedValue: TData[keyof TData],
    primaryKeyValue: TData[typeof this.primaryKey],
  ) {
    let i = 0

    while (
      i < index.values.length &&
      index.values[i].indexedValue < indexedValue
    ) {
      i++
    }

    if (
      i === index.values.length ||
      index.values[i].indexedValue !== indexedValue
    ) {
      // If the value is not found, insert it
      index.values.splice(i, 0, {
        indexedValue,
        primaryKeys: [primaryKeyValue],
      })
    } else {
      if (index.unique) {
        throw new Error(
          `Unique constraint violation on index "${keyPath.toString()}". Value "${indexedValue}" already exists.`,
        )
      }

      // If the value is found, add the primary key to the list
      index.values[i].primaryKeys.push(primaryKeyValue)
    }
  }

  updateRowColumnIndexing(
    primaryKeyValue: TData[typeof this.primaryKey],
    keyPath: keyof TData,
    oldValue: TData[typeof keyPath],
    newValue: TData[typeof keyPath],
  ) {
    const index = this.indexes.get(keyPath)!

    const oldPosition = index.values.findIndex(
      (it) => it.indexedValue === oldValue,
    )

    const oldSubPosition = index.values[oldPosition].primaryKeys.findIndex(
      (it) => it === primaryKeyValue,
    )

    index.values[oldPosition].primaryKeys.splice(oldSubPosition, 1)

    // we don't want to keep indexed values that no longer exist
    if (index.values[oldPosition].primaryKeys.length === 0) {
      index.values.splice(oldPosition, 1)
    }

    this.insertRowColumnIndexing(keyPath, index, newValue, primaryKeyValue)
  }

  removeRowIndexing(
    primaryKeyValue: TData[keyof TData],
    keyPath: keyof TData,
    oldValue: TData[typeof keyPath],
  ) {
    const index = this.indexes.get(keyPath)!

    const oldPosition = index.values.findIndex(
      (it) => it.indexedValue === oldValue,
    )

    const oldSubPosition = index.values[oldPosition].primaryKeys.findIndex(
      (it) => it === primaryKeyValue,
    )

    index.values[oldPosition].primaryKeys.splice(oldSubPosition, 1)

    // we don't want to keep indexed values that no longer exist
    if (index.values[oldPosition].primaryKeys.length === 0) {
      index.values.splice(oldPosition, 1)
    }
  }

  private insertRowIndexing(keyPath: keyof TData, row: TData) {
    const index = this.indexes.get(keyPath)

    check(isDefined(index), `Index "${keyPath.toString()}" does not exist.`)

    const indexedValue = row[keyPath as keyof TData]

    this.insertRowColumnIndexing(
      keyPath,
      index,
      indexedValue,
      row[this.primaryKey],
    )
  }

  insert(data: TData) {
    // add indexes first to ensure unique constraints are enforced
    for (const keyPath of this.indexes.keys()) {
      this.insertRowIndexing(keyPath, data)
    }

    // TODO: revert indexes if insert fails

    this.rows.set(data[this.primaryKey], data)
  }

  insertAll(data: Array<TData>) {
    // TODO optimize this
    data.forEach((it) => this.insert(it))
  }

  deleteAll() {
    this.rows.clear()

    this.indexes.forEach((index) => {
      index.values = []
    })
  }

  get(primaryKeyValue: TData[typeof this.primaryKey]) {
    return this.rows.get(primaryKeyValue)
  }

  createCursor(
    keyPath: keyof TData,
    direction: DatabaseCursorDirection = 'next',
  ): DatabaseCursor<TData> {
    check(!this.locked, 'Tried to open a cursor on a locked table.')
    this.locked = true
    return new InMemoryCursorImpl(this, keyPath, direction, () => {
      this.locked = false
    })
  }
}
