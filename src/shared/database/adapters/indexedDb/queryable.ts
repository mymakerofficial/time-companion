import type {
  Queryable,
  FindArgs,
  FindManyArgs,
} from '@shared/database/database'
import { firstOf } from '@shared/lib/utils/list'
import type { Nullable } from '@shared/lib/utils/types'
import { isNull } from '@shared/lib/utils/checks'
import { wherePredicateFn } from '@shared/database/helpers/wherePredicateFn'
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
    return new Promise((resolve, reject) => {
      const request = this.objectStore.openCursor()

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
        const matches = wherePredicateFn(value, args?.where)

        if (matches) {
          list.push(value)
        }

        cursor.continue()
      }

      request.onerror = () => reject(request.error)
    })
  }
}
