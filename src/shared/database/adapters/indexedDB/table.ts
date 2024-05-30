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
import { isNotNull, isNull, isUndefined } from '@shared/lib/utils/checks'
import {
  DatabaseUndefinedColumnError,
  DatabaseUndefinedTableError,
  DatabaseUniqueViolationError,
} from '@shared/database/types/errors'
import { arraysHaveOverlap } from '@shared/lib/utils/list'
import {
  iteratorToList,
  iteratorToSortedList,
} from '@shared/database/helpers/iteratorToList'
import type { TableSchemaRaw } from '@shared/database/types/schema'
import { keysOf, valuesOf } from '@shared/lib/utils/object'
import { promisedRequest } from '@shared/database/adapters/indexedDB/helpers/promisedRequest'
import { openIterator } from '@shared/database/adapters/indexedDB/helpers/openIterator'

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

  protected openIterator(props: Partial<AdapterBaseQueryProps>) {
    return openIterator<TRow>(this.objectStore, props)
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
    await this.checkColumnsExist(props.data)

    const { iterator } = await this.openIterator(props)

    const results = []
    for await (const cursor of iterator) {
      await cursor.update({
        ...cursor.value,
        ...props.data,
      })
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
    await this.checkColumnsExist(props.data)
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

  protected async checkColumnsExist(data: Partial<TRow>): Promise<void> {
    if (isUndefined(this.tableSchema)) {
      // if we are not given a schema, we just hope for the best
      return
    }

    const columnsOnTable = keysOf(this.tableSchema.columns)
    const columnsInData = keysOf(data)

    // check if all columns in data are in the table schema
    for (const column of columnsInData) {
      const columnExists = columnsOnTable.includes(column)

      if (!columnExists) {
        throw new DatabaseUndefinedColumnError(this.tableName, column as string)
      }
    }
  }
}
