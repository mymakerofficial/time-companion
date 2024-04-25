import type { InMemoryDataTable } from '@shared/database/adapters/inMemory/helpers/dataTable'
import { getOrNull, getOrThrow } from '@shared/lib/utils/result'
import type { Nullable } from '@shared/lib/utils/types'
import { check, isDefined, isNotNull, isNull } from '@shared/lib/utils/checks'
import type { OrderByDirection } from '@shared/database/database'
import { todo } from '@shared/lib/utils/todo'
import { keysOf } from '@shared/lib/utils/object'
import { asSet, toArray } from '@shared/lib/utils/list'

export interface InMemoryCursor<TData extends object> {
  value(): Nullable<TData>
  update(data: Partial<TData>): void
  delete(): void
  next(): void
}

export class InMemoryCursorImpl<TData extends object>
  implements InMemoryCursor<TData>
{
  private position: number
  // subPosition is the index of the primary key in the current index value
  private subPosition = 0

  // number to increment the index by
  private readonly increment: number

  private readonly indexesSet: Set<keyof TData>

  constructor(
    private table: InMemoryDataTable<TData>,
    private keyPath: keyof TData,
    direction: OrderByDirection,
  ) {
    // TODO: check if index actually exists

    this.increment = direction === 'asc' ? 1 : -1
    this.position =
      direction === 'asc'
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
    const key = getOrThrow(
      this.getCurrentPrimaryKey(),
      'Failed to get primary key.',
    )
    const current = getOrThrow(
      this.table.getRows().get(key),
      'Failed to get row.',
    )

    const changedColumns = asSet(keysOf(data))

    check(
      !changedColumns.has(this.table.getPrimaryKey()),
      `Primary key cannot be changed. Tried to change columns: ${toArray(changedColumns)}.`,
    )

    // update row
    this.table.getRows().set(key, { ...current, ...data })

    // update indexes
    this.indexesSet.forEach((keyPath) => {
      if (!changedColumns.has(keyPath)) {
        return
      }

      this.table.updateRowColumnIndexing(
        key,
        keyPath,
        current[keyPath],
        data[keyPath] as TData[keyof TData],
      )
    })
  }

  delete(): void {
    todo()
  }

  next(): void {
    this.subPosition += 1

    if (this.subPosition >= this.getCurrentIndexValue()!.primaryKeys.length) {
      this.position += this.increment
      this.subPosition = 0
    }
  }
}
