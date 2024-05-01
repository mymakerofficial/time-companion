import type {
  Queryable,
  FindArgs,
  FindManyArgs,
} from '@shared/database/types/database'
import { emptyArray, firstOf } from '@shared/lib/utils/list'
import { filteredCursorIterator } from '@shared/database/adapters/indexedDB/helpers/filteredCursorIterator'

export class IDBAdapterQueryable<TData extends object>
  implements Queryable<TData>
{
  constructor(
    protected readonly objectStore: IDBObjectStore,
    protected readonly predicate?: (value: TData) => boolean,
  ) {}

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
    const iterable = filteredCursorIterator(
      this.objectStore,
      args,
      this.predicate,
    )

    const list: Array<TData> = emptyArray()

    for await (const cursor of iterable) {
      list.push(cursor.value)
    }

    return list
  }
}
