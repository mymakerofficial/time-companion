import type {
  AdapterBaseQueryProps,
  AdapterDeleteProps,
  AdapterInsertManyProps,
  AdapterInsertProps,
  AdapterSelectProps,
  AdapterUpdateProps,
  TableAdapter,
} from '@shared/database/types/adapter'
import type { Nullable } from '@shared/lib/utils/types'
import { check, isNotNull, isNull, isUndefined } from '@shared/lib/utils/checks'
import {
  DatabaseInvalidRangeColumnError,
  DatabaseUndefinedTableError,
  DatabaseUniqueViolationError,
} from '@shared/database/types/errors'
import { arraysHaveOverlap, toArray } from '@shared/lib/utils/list'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'
import { filteredIterator } from '@shared/database/helpers/filteredIterator'
import { cursorIterator } from '@shared/database/helpers/cursorIterator'
import type {
  KeyRange,
  OrderByDirection,
} from '@shared/database/types/database'
import type { DatabaseCursor } from '@shared/database/types/cursor'
import { IDBKeyRange } from 'fake-indexeddb'
import { directionToIdbCursorDirection } from '@shared/database/adapters/indexedDB/helpers/directionToIdbCursorDirection'
import { IndexedDBCursorImpl } from '@shared/database/adapters/indexedDB/helpers/cursor'
import {
  iteratorToList,
  iteratorToSortedList,
} from '@shared/database/helpers/iteratorToList'
import type { TableSchemaRaw } from '@shared/database/types/schema'
import { keysOf, valuesOf } from '@shared/lib/utils/object'
import { promisedRequest } from '@shared/database/adapters/indexedDB/helpers/promisedRequest'

export class IdbTableAdapter<TRow extends object>
  implements TableAdapter<TRow>
{
  constructor(
    protected readonly tx: IDBTransaction,
    protected readonly tableName: string,
    protected readonly tableSchema?: TableSchemaRaw<TRow>,
  ) {}

  private _objectStore: Nullable<IDBObjectStore> = null

  protected get objectStore(): IDBObjectStore {
    // only create the object store once we need it
    //  this is because if this operation fails, we want it to fail as late as possible
    //  when the user actually wants to execute a query

    // ensure object store is only created once
    if (isNull(this._objectStore)) {
      try {
        this._objectStore = this.tx.objectStore(this.tableName)
      } catch (error) {
        throw new DatabaseUndefinedTableError(this.tableName)
      }
    }
    return this._objectStore
  }

  protected async openIterator(props: Partial<AdapterBaseQueryProps>) {
    const indexes = toArray(this.objectStore.indexNames)
    const primaryKey = this.objectStore.keyPath

    // if the range or orderBy column is the primary key, make it null
    //  we use null to indicate that we should not use an index
    //  but use the object store itself

    // undefined means there is actually no value

    const rangeColumn =
      props.range?.column.columnName !== primaryKey
        ? props.range?.column.columnName
        : null
    const orderByColumn =
      props.orderBy?.column.columnName !== primaryKey
        ? props.orderBy?.column.columnName
        : null

    check(
      isNull(rangeColumn) ||
        isUndefined(rangeColumn) ||
        indexes.includes(rangeColumn),
      () => new DatabaseInvalidRangeColumnError(rangeColumn!),
    )

    // we prefer the range column over the orderBy column
    //  if both are given, we need to sort manually later
    const keyPath = rangeColumn ?? orderByColumn ?? null

    const keyPathIsIndex = isNotNull(keyPath)
      ? indexes.includes(keyPath)
      : false

    // we need to manually sort if a range is given that doesn't match the orderBy column
    //  or if the orderBy column is not indexed
    const requiresManualSort =
      !keyPathIsIndex ||
      (isNotNull(rangeColumn) && rangeColumn !== orderByColumn)

    // null means we sort by primary key
    const indexName = keyPathIsIndex ? keyPath : null

    const direction = getOrDefault(props.orderBy?.direction, 'asc')

    const where = getOrNull(props.where)
    const range = getOrNull(props.range)
    const limit = getOrDefault(props.limit, Infinity)
    const offset = getOrDefault(props.offset, 0)

    // we have now planned the query and can finally open the cursor

    const cursor = await this.openCursor(indexName, direction, range)

    return {
      iterator: filteredIterator(cursorIterator(cursor), where, limit, offset),
      byColumn: orderByColumn as Nullable<keyof TRow>,
      direction,
      requiresManualSort,
    }
  }

  protected openCursor(
    indexName: Nullable<string>,
    direction: OrderByDirection,
    keyRange: Nullable<KeyRange>,
  ): Promise<DatabaseCursor<TRow>> {
    return new Promise((resolve, reject) => {
      const indexOrObjectStore = isNotNull(indexName)
        ? this.objectStore.index(indexName)
        : this.objectStore

      const range = isNotNull(keyRange)
        ? IDBKeyRange.bound(
            // turn the key range into a key range... but different
            keyRange.lower,
            keyRange.upper,
            keyRange.lowerOpen,
            keyRange.upperOpen,
          )
        : null

      const cursorDirection = directionToIdbCursorDirection(direction)

      const request = indexOrObjectStore.openCursor(range, cursorDirection)

      request.onsuccess = () => {
        const cursor = new IndexedDBCursorImpl<TRow>(
          request,
          this.objectStore.keyPath as keyof TRow,
        )

        resolve(cursor)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  async select(props: AdapterSelectProps<TRow>): Promise<Array<TRow>> {
    const { iterator, requiresManualSort, byColumn, direction } =
      await this.openIterator(props)

    if (requiresManualSort && isNotNull(byColumn)) {
      const compareFn =
        direction === 'asc'
          ? (a: TRow, b: TRow) => (a[byColumn] > b[byColumn] ? 1 : -1)
          : (a: TRow, b: TRow) => (a[byColumn] < b[byColumn] ? 1 : -1)

      return await iteratorToSortedList(iterator, compareFn)
    } else {
      return await iteratorToList(iterator)
    }
  }

  async update(props: AdapterUpdateProps<TRow>): Promise<Array<TRow>> {
    await this.checkUniqueConstraints(props.data)

    const { iterator } = await this.openIterator(props)

    const results = []
    for await (const cursor of iterator) {
      await cursor.update(props.data)
      results.push(cursor.value)
    }

    return results
  }

  async delete(props: AdapterDeleteProps<TRow>): Promise<void> {
    const { iterator } = await this.openIterator(props)

    for await (const cursor of iterator) {
      await cursor.delete()
    }
  }

  deleteAll(): Promise<void> {
    return promisedRequest(this.objectStore.clear())
  }

  async insert(props: AdapterInsertProps<TRow>): Promise<TRow> {
    await this.checkUniqueConstraints(props.data)
    await promisedRequest(this.objectStore.add(props.data))
    return props.data
  }

  async insertMany(props: AdapterInsertManyProps<TRow>): Promise<Array<TRow>> {
    const promises = props.data.map((data) => this.insert({ data }))
    return await Promise.all(promises)
  }

  protected async checkUniqueConstraints(data: Partial<TRow>): Promise<void> {
    if (isUndefined(this.tableSchema)) {
      // if we are not given a schema, we just hope for the best
      return
    }

    const uniqueColumns = valuesOf(this.tableSchema.columns)
      .filter((column) => column.isUnique)
      .map((column) => column.columnName) as Array<keyof TRow>

    const changedColumns = keysOf(data)

    if (!arraysHaveOverlap(changedColumns, uniqueColumns)) {
      return
    }

    for (const column of uniqueColumns) {
      const value = data[column] as any

      const count = await promisedRequest(
        this.objectStore.index(column as string).count(value),
      )

      if (count > 0) {
        throw new DatabaseUniqueViolationError(
          this.tableName,
          column as string,
          value,
        )
      }
    }
  }
}
