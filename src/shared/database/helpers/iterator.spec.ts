import type { DatabaseCursor } from '@shared/database/types/cursor'
import { describe, expect, it } from 'vitest'
import { cursorIterator } from '@shared/database/helpers/cursorIterator'
import {
  iteratorToList,
  iteratorToSortedList,
} from '@shared/database/helpers/iteratorToList'

describe('iteratorToList', () => {
  it('should convert the iterator to a list', async () => {
    const cursor = new MockCursor(
      [1, 3, 2].map((value) => ({
        value,
      })),
    )

    const iterator = cursorIterator(cursor)

    const res = await iteratorToList(iterator)

    expect(res).toEqual([{ value: 1 }, { value: 3 }, { value: 2 }])
  })
})

describe('iteratorToSortedList', () => {
  it('should sort the list', async () => {
    const cursor = new MockCursor(
      [2, 4, 1, 3].map((value) => ({
        value,
      })),
    )

    const iterator = cursorIterator(cursor)

    const res = await iteratorToSortedList(iterator, (a, b) => {
      return a.value < b.value ? -1 : 1
    })

    expect(res).toEqual([
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
    ])
  })
})

class MockCursor<TRow extends object> implements DatabaseCursor<TRow> {
  constructor(protected list: Array<TRow>) {}

  protected index = 0

  get value() {
    return this.list[this.index] ?? null
  }

  continue(): Promise<void> {
    this.index++
    return Promise.resolve()
  }

  delete(): Promise<void> {
    return Promise.resolve()
  }

  update(data: Partial<TRow>): Promise<void> {
    return Promise.resolve()
  }

  close(): void {}
}
