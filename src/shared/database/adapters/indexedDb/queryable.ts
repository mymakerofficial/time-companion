import type {
  Queryable,
  FindArgs,
  FindManyArgs,
} from '@shared/database/database'
import { firstOf } from '@shared/lib/utils/list'
import type { Nullable } from '@shared/lib/utils/types'
import { check, isDefined, isNotNull, isNull } from '@shared/lib/utils/checks'
import { unwrappedWherePredicateFn } from '@shared/database/helpers/wherePredicateFn'
import { unwrapWhere } from '@shared/database/helpers/unwrapWhere'
import { unwrapOrderBy } from '@shared/database/helpers/unwrapOrderBy'

export class IDBAdapterQueryable<TData extends object>
  implements Queryable<TData>
{
  constructor(protected readonly objectStore: IDBObjectStore) {}

  async findFirst(args?: FindArgs<TData>): Promise<TData> {
    return firstOf(
      await this.findMany({
        ...args,
        limit: 1,
        offset: 0,
      }),
    )
  }

  async findMany(args?: FindManyArgs<TData>): Promise<Array<TData>> {
    const unwrappedWhere = isDefined(args?.where)
      ? unwrapWhere(args!.where)
      : null

    const unwrappedOrderBy = isDefined(args?.orderBy)
      ? unwrapOrderBy(args!.orderBy)
      : { key: null, direction: 'asc' }

    const orderBy = unwrappedOrderBy.key as string
    const direction = unwrappedOrderBy.direction === 'asc' ? 'next' : 'prev'

    console.log(this.objectStore.indexNames, orderBy)

    check(
      isNull(orderBy) || this.objectStore.indexNames.contains(orderBy),
      `Column "${orderBy}" is not indexed. You can only order by indexed columns.`,
    )

    const indexOrObjectStore = isNotNull(orderBy)
      ? this.objectStore.index(orderBy)
      : this.objectStore

    return new Promise((resolve, reject) => {
      const request = indexOrObjectStore.openCursor(null, direction)

      const list: Array<TData> = []

      request.onsuccess = () => {
        const cursor: Nullable<IDBCursorWithValue> = request.result

        // if the cursor is null we have reached the end of the object store
        if (isNull(cursor)) {
          return resolve(list)
        }

        // we have reached the limit of items we want to return
        if (args?.limit && list.length >= args.limit) {
          return resolve(list)
        }

        const value = cursor.value
        const matches = isNotNull(unwrappedWhere)
          ? unwrappedWherePredicateFn(value, unwrappedWhere)
          : true

        if (matches) {
          list.push(value)
        }

        cursor.continue()
      }

      request.onerror = () => reject(request.error)
    })
  }
}
