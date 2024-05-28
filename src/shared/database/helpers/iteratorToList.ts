import type { DatabaseIterator } from '@shared/database/types/cursor'

/***
 * Convert an iterator to a list
 * @param iterator The iterator to convert
 * @returns A promise that resolves to the list of values
 */
export async function iteratorToList<TRow extends object>(
  iterator: DatabaseIterator<TRow>,
): Promise<Array<TRow>> {
  const list: Array<TRow> = []

  for await (const cursor of iterator) {
    list.push(cursor.value)
  }

  return list
}

/***
 * Convert an iterator to a sorted list.
 *
 * This function sorts the list on the fly instead of waiting for the iterator to finish.
 * @param iterator The iterator to convert
 * @param compareFn The comparison function
 * @returns A promise that resolves to the sorted list of values
 */
export async function iteratorToSortedList<TRow extends object>(
  iterator: DatabaseIterator<TRow>,
  compareFn: (a: TRow, b: TRow) => number,
): Promise<Array<TRow>> {
  const list: Array<TRow> = []

  for await (const cursor of iterator) {
    // Insert the cursor value in the correct position

    let index = 0
    for (const value of list) {
      if (compareFn(cursor.value, value) < 0) {
        break
      }

      index++
    }

    list.splice(index, 0, cursor.value)
  }

  return list
}
