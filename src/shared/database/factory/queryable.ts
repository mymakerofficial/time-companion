import type {
  FindArgs,
  FindManyArgs,
  Queryable,
} from '@shared/database/types/database'
import type { DatabaseTableAdapter } from '@shared/database/types/adapter'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'
import { maybeUnwrapOrderBy } from '@shared/database/helpers/unwrapOrderBy'
import type { Nullable } from '@shared/lib/utils/types'
import { check, isNull } from '@shared/lib/utils/checks'
import { filteredIterator } from '@shared/database/factory/helpers/filteredIterator'
import { cursorIterator } from '@shared/database/factory/helpers/cursorIterator'
import { firstOf, firstOfOrNull } from '@shared/lib/utils/list'

export class DatabaseQueryableImpl<TData extends object>
  implements Queryable<TData>
{
  constructor(protected readonly tableAdapter: DatabaseTableAdapter<TData>) {}

  protected async openIterator(
    args?: FindManyArgs<TData>,
    predicate?: (value: TData) => boolean,
  ) {
    const unwrappedOrderBy = getOrDefault(maybeUnwrapOrderBy(args?.orderBy), {
      key: null,
      direction: 'asc',
    })

    const orderBy = unwrappedOrderBy.key as Nullable<string>
    const direction = unwrappedOrderBy.direction === 'desc' ? 'prev' : 'next'

    const indexes = await this.tableAdapter.getIndexNames()

    check(
      isNull(orderBy) || indexes.includes(orderBy),
      `The index "${orderBy}" does not exist. You can only order by existing indexes or primary key.`,
    )

    const cursor = await this.tableAdapter.openCursor(orderBy, direction)
    return filteredIterator(cursorIterator(cursor), args, predicate)
  }

  async findFirst(args?: FindArgs<TData>): Promise<Nullable<TData>> {
    return firstOfOrNull(
      await this.findMany({
        ...args,
        limit: 1,
        offset: 0,
      }),
    )
  }

  async findMany(args?: FindManyArgs<TData>): Promise<Array<TData>> {
    const iterator = await this.openIterator(args)

    const results = []
    for await (const cursor of iterator) {
      results.push(cursor.value())
    }

    return results
  }
}
