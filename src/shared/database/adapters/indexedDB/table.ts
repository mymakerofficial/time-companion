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
import {
  isAbsent,
  isDefined,
  isNotNull,
  isNull,
  isPresent,
  isUndefined,
} from '@shared/lib/utils/checks'
import {
  DatabaseNotNullViolationError,
  DatabaseUndefinedColumnError,
  DatabaseUndefinedTableError,
  DatabaseUniqueViolationError,
} from '@shared/database/types/errors'
import { arraysHaveOverlap, firstOfOrNull } from '@shared/lib/utils/list'
import { iteratorToList } from '@shared/database/helpers/iteratorToList'
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

    const list = await iteratorToList(iterator)

    if (requiresManualSort && isNotNull(byColumn)) {
      const compareFn =
        direction === 'asc'
          ? (a: TRow, b: TRow) => (a[byColumn] > b[byColumn] ? 1 : -1)
          : (a: TRow, b: TRow) => (a[byColumn] < b[byColumn] ? 1 : -1)

      list.sort(compareFn)
    }

    return list
  }

  async update(props: AdapterUpdateProps<TRow>): Promise<Array<TRow>> {
    const possibleUniqueViolations =
      await this.getPossibleUniqueConstraintViolations(props.data)
    await this.checkColumnsExist(props.data)

    const { iterator } = await this.openIterator(props)

    const results = []
    for await (const cursor of iterator) {
      // assuming no duplicates got in the table somehow
      //  only a violation that is not the current row is a problem
      const violation = possibleUniqueViolations.find(
        (violation) => violation.value !== cursor.value[violation.column],
      )

      if (isDefined(violation)) {
        throw new DatabaseUniqueViolationError(
          this.tableName,
          violation.column as string,
          violation.value,
        )
      }

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
    await this.checkRequiredColumns(props.data)
    await promisedRequest(this.objectStore.add(props.data))
    return props.data
  }

  async insertMany(props: AdapterInsertManyProps<TRow>): Promise<Array<TRow>> {
    const promises = props.data.map((data) => this.insert({ data }))
    return await Promise.all(promises)
  }

  protected async getPossibleUniqueConstraintViolations(data: Partial<TRow>) {
    if (isUndefined(this.tableSchema)) {
      // if we are not given a schema, we just hope for the best
      return []
    }

    const uniqueColumns = valuesOf(this.tableSchema.columns)
      .filter((column) => column.isUnique)
      .map((column) => column.columnName) as Array<keyof TRow>

    const changedColumns = keysOf(data)

    if (!arraysHaveOverlap(changedColumns, uniqueColumns)) {
      return []
    }

    const list = []

    for (const column of uniqueColumns) {
      const value = data[column] as any

      const res = await promisedRequest(
        this.objectStore.index(column as string).getKey(value),
      )

      if (isPresent(res)) {
        list.push({ column, value })
      }
    }

    return list
  }

  protected async checkUniqueConstraints(data: Partial<TRow>): Promise<void> {
    const violation = firstOfOrNull(
      await this.getPossibleUniqueConstraintViolations(data),
    )

    if (isNotNull(violation)) {
      throw new DatabaseUniqueViolationError(
        this.tableName,
        violation.column as string,
        violation.value,
      )
    }
  }

  /***
   * Check if all columns in the data are in the table schema
   */
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

  protected async checkRequiredColumns(data: Partial<TRow>): Promise<void> {
    if (isUndefined(this.tableSchema)) {
      // if we are not given a schema, we just hope for the best
      return
    }

    const requiredColumns = valuesOf(this.tableSchema.columns)
      .filter((column) => !column.isNullable)
      .map((column) => column.columnName) as Array<keyof TRow>

    for (const column of requiredColumns) {
      const value = data[column] as any

      if (isAbsent(value)) {
        throw new DatabaseNotNullViolationError(
          this.tableName,
          column as string,
        )
      }
    }
  }
}
