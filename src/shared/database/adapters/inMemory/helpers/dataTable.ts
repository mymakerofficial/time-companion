import { emptyMap, toArray } from '@shared/lib/utils/list'
import { check, isDefined } from '@shared/lib/utils/checks'
import {
  type InMemoryCursor,
  InMemoryCursorImpl,
} from '@shared/database/adapters/inMemory/helpers/cursor'
import type { OrderByDirection } from '@shared/database/database'

type Index<
  TData extends object,
  TPrimaryKey extends keyof TData,
  TIndexKey extends keyof TData = keyof TData,
> = {
  unique: boolean
  values: Array<{
    value: TData[TIndexKey]
    keys: Array<TData[TPrimaryKey]>
  }>
}

export interface InMemoryDataTable<TData extends object> {
  getPrimaryKey(): keyof TData
  getRows(): Map<TData[keyof TData], TData>
  getIndexes(): Map<keyof TData, Index<TData, keyof TData>>
  getIndexNames(): Array<string>
  createIndex(keyPath: keyof TData, unique: boolean): void
  removeIndex(keyPath: keyof TData): void
  insert(data: TData): void
  createCursor(
    keyPath: keyof TData,
    direction?: OrderByDirection,
  ): InMemoryCursor<TData>
}

export type InMemoryDataTables = Map<string, InMemoryDataTable<any>>

export class InMemoryDataTableImpl<TData extends object>
  implements InMemoryDataTable<TData>
{
  protected primaryKey: keyof TData
  protected rows: Map<TData[typeof this.primaryKey], TData>
  protected indexes: Map<
    keyof TData /* keyPath */,
    Index<TData, typeof this.primaryKey>
  >

  constructor(primaryKey: keyof TData) {
    this.primaryKey = primaryKey
    this.rows = emptyMap()
    this.indexes = emptyMap()

    this.indexes.set(primaryKey, {
      unique: true,
      values: [],
    })
  }

  getPrimaryKey() {
    return this.primaryKey
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

  private insertIndexSorted(
    keyPath: keyof TData,
    index: Index<TData, typeof this.primaryKey>,
    value: TData[keyof TData],
    primaryKeyValue: TData[typeof this.primaryKey],
  ) {
    let i = 0

    while (i < index.values.length && index.values[i].value < value) {
      i++
    }

    if (i === index.values.length || index.values[i].value !== value) {
      // If the value is not found, insert it
      index.values.splice(i, 0, {
        value,
        keys: [primaryKeyValue],
      })
    } else {
      if (index.unique) {
        throw new Error(
          `Unique constraint violation on index ${keyPath.toString()}. Value ${value} already exists.`,
        )
      }

      // If the value is found, add the primary key to the list
      index.values[i].keys.push(primaryKeyValue)
    }
  }

  private addRowToIndex(keyPath: keyof TData, row: TData) {
    const index = this.indexes.get(keyPath)

    check(isDefined(index), `Index "${keyPath.toString()}" does not exist.`)

    const indexedValue = row[keyPath as keyof TData]

    this.insertIndexSorted(keyPath, index, indexedValue, row[this.primaryKey])
  }

  insert(data: TData) {
    // add indexes first to ensure unique constraints are enforced
    for (const keyPath of this.indexes.keys()) {
      this.addRowToIndex(keyPath, data)
    }

    // TODO: revert indexes if insert fails

    this.rows.set(data[this.primaryKey], data)
  }

  get(primaryKeyValue: TData[typeof this.primaryKey]) {
    return this.rows.get(primaryKeyValue)
  }

  createCursor(
    keyPath: keyof TData,
    direction: OrderByDirection = 'asc',
  ): InMemoryCursor<TData> {
    return new InMemoryCursorImpl(this, keyPath, direction)
  }
}
