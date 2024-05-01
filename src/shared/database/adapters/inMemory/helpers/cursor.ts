import type { InMemoryDataTable } from '@shared/database/adapters/inMemory/helpers/dataTable'
import { getOrNull, getOrThrow } from '@shared/lib/utils/result'
import type { Nullable } from '@shared/lib/utils/types'
import { check, isNull } from '@shared/lib/utils/checks'
import { keysOf } from '@shared/lib/utils/object'
import { asSet, toArray } from '@shared/lib/utils/list'
import type {
  DatabaseCursor,
  DatabaseCursorDirection,
} from '@shared/database/types/adapter'

type IndexUpdate<TData extends object> = {
  primaryKey: TData[keyof TData]
  keyPath: keyof TData
  oldValue: TData[keyof TData]
  newValue: TData[keyof TData]
}

export class InMemoryCursorImpl<TData extends object>
  implements DatabaseCursor<TData>
{
  private position: number
  // subPosition is the index of the primary key in the current index value
  private subPosition = 0

  // number to increment the position by
  private readonly increment: number

  private readonly indexesSet: Set<keyof TData>

  // remember all updates to be applied when cursor is closed
  private readonly indexUpdateQueue: Array<IndexUpdate<TData>> = []
  private readonly deleteQueue: Array<TData[keyof TData]> = []

  constructor(
    private table: InMemoryDataTable<TData>,
    private keyPath: keyof TData,
    direction: DatabaseCursorDirection,
    private unlockTable: () => void,
  ) {
    // TODO: check if index actually exists

    this.increment = direction === 'next' ? 1 : -1
    this.position =
      direction === 'next'
        ? 0
        : this.table.getIndexes().get(this.keyPath)!.values.length - 1

    this.indexesSet = asSet(this.table.getIndexes().keys())
  }

  private getCurrentIndexValue() {
    return getOrNull(
      this.table.getIndexes().get(this.keyPath)?.values[this.position],
    )
  }

  private getCurrentPrimaryKey(): Nullable<TData[keyof TData]> {
    return getOrNull(this.getCurrentIndexValue()?.primaryKeys[this.subPosition])
  }

  value(): Nullable<TData> {
    const key = this.getCurrentPrimaryKey()

    if (isNull(key)) {
      return null
    }

    return getOrNull(this.table.getRows().get(key))
  }

  update(data: Partial<TData>): void {
    const primaryKey = getOrThrow(
      this.getCurrentPrimaryKey(),
      'Failed to get primary key.',
    )
    const current = getOrThrow(
      this.table.getRows().get(primaryKey),
      'Failed to get row.',
    )

    const changedColumns = asSet(keysOf(data))

    check(
      !changedColumns.has(this.table.getPrimaryKey()),
      `Primary key cannot be changed. Tried to change columns: ${toArray(changedColumns)}.`,
    )

    // update row
    this.table.getRows().set(primaryKey, { ...current, ...data })

    this.indexesSet.forEach((keyPath) => {
      if (!changedColumns.has(keyPath)) {
        return
      }

      // store updates to the index for later,
      //  because it is literally impossible to update the index while iterating over it.
      //  The order of rows would be changed and the cursor would get lost.

      // so this is why everybody tells you to not make your own database

      this.indexUpdateQueue.push({
        primaryKey,
        keyPath,
        oldValue: current[keyPath],
        newValue: data[keyPath] as TData[keyof TData],
      })
    })
  }

  delete(): void {
    const primaryKey = getOrThrow(
      this.getCurrentPrimaryKey(),
      'Failed to get primary key.',
    )

    // don't delete the row now, because it would mess up the cursor
    //  instead, remember the primary key to delete it later
    this.deleteQueue.push(primaryKey)
  }

  continue(): Promise<void> {
    this.subPosition += 1

    if (this.subPosition >= this.getCurrentIndexValue()!.primaryKeys.length) {
      this.position += this.increment
      this.subPosition = 0
    }

    return Promise.resolve()
  }

  close(): void {
    this.indexUpdateQueue.forEach(
      ({ primaryKey, keyPath, oldValue, newValue }) => {
        this.table.updateRowColumnIndexing(
          primaryKey,
          keyPath,
          oldValue,
          newValue,
        )
      },
    )

    this.deleteQueue.forEach((primaryKey) => {
      const oldRow = getOrThrow(
        this.table.getRows().get(primaryKey),
        'Failed to get row.',
      )
      this.indexesSet.forEach((keyPath) => {
        this.table.removeRowIndexing(primaryKey, keyPath, oldRow[keyPath])
      })
      this.table.getRows().delete(primaryKey)
    })

    this.unlockTable()
  }
}
