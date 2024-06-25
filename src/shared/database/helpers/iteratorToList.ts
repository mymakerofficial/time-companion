import type { DatabaseIterator } from '@database/types/cursor'

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
