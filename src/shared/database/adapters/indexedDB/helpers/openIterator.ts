import { filteredIterator } from '@database/helpers/filteredIterator'
import { cursorIterator } from '@database/helpers/cursorIterator'
import { openCursor } from '@database/adapters/indexedDB/helpers/openCursor'
import { type IDBQueryPlan } from '@database/adapters/indexedDB/helpers/planQuery'

export async function openIterator<TRow extends object>(
  objectStore: IDBObjectStore,
  queryPlan: IDBQueryPlan<TRow>,
) {
  const { indexName, direction, range, where, limit, offset } = queryPlan

  const cursor = await openCursor<TRow>(
    objectStore,
    indexName,
    direction,
    range,
  )

  return filteredIterator(cursorIterator(cursor), where, limit, offset)
}
