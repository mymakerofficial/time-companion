import type { InMemoryDataTable } from '@shared/database/adapters/inMemory/helpers/dataTable'
import { getOrNull } from '@shared/lib/utils/result'
import type { Nullable } from '@shared/lib/utils/types'
import { isNull } from '@shared/lib/utils/checks'
import type { OrderByDirection } from '@shared/database/database'
import { todo } from '@shared/lib/utils/todo'

export interface InMemoryCursor<TData extends object> {
  value(): Nullable<TData>
  update(data: Partial<TData>): void
  delete(): void
  next(): void
}

export class InMemoryCursorImpl<TData extends object>
  implements InMemoryCursor<TData>
{
  private index: number
  private subIndex = 0

  // number to increment the index by
  private readonly increment: number

  constructor(
    private table: InMemoryDataTable<TData>,
    private keyPath: keyof TData,
    direction: OrderByDirection,
  ) {
    this.increment = direction === 'asc' ? 1 : -1
    this.index = direction === 'asc' ? 0 : -1
  }

  private getCurrentPrimaryKey(): Nullable<TData[keyof TData]> {
    return getOrNull(
      this.table
        .getIndexes()
        .get(this.keyPath)
        ?.values.at(this.index)
        ?.keys.at(this.subIndex),
    )
  }

  value(): Nullable<TData> {
    const key = this.getCurrentPrimaryKey()

    if (isNull(key)) {
      return null
    }

    return getOrNull(this.table.getRows().get(key))
  }

  update(data: Partial<TData>): void {
    todo()
  }

  delete(): void {
    todo()
  }

  next(): void {
    this.subIndex += 1

    if (
      this.subIndex >=
      this.table.getIndexes().get(this.keyPath)!.values.at(this.index)!.keys
        .length
    ) {
      this.index += this.increment
      this.subIndex = 0
    }
  }
}
