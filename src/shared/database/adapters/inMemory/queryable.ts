import type {
  FindArgs,
  FindManyArgs,
  Queryable,
} from '@shared/database/database'
import { firstOf } from '@shared/lib/utils/list'
import type { InMemoryDataTable } from '@shared/database/adapters/inMemory/helpers/dataTable'
import { wherePredicate } from '@shared/database/helpers/wherePredicate'
import { unwrappedOrderByCompare } from '@shared/database/helpers/orderByCompare'
import { check } from '@shared/lib/utils/checks'
import {
  maybeUnwrapOrderBy,
  type UnwrapOrderBy,
} from '@shared/database/helpers/unwrapOrderBy'
import { getOrDefault } from '@shared/lib/utils/result'

export class InMemoryDatabaseQueryable<TData extends object>
  implements Queryable<TData>
{
  constructor(protected readonly table: InMemoryDataTable<TData>) {}

  async findFirst(args?: FindArgs<TData>): Promise<TData> {
    return new Promise(async (resolve) => {
      resolve(firstOf(await this.findMany(args)))
    })
  }

  private syncFindMany(args: FindManyArgs<TData> = {}): Array<TData> {
    const unwrappedOrderBy = getOrDefault(maybeUnwrapOrderBy(args?.orderBy), {
      key: this.table.primaryKey,
      direction: 'asc',
    } as UnwrapOrderBy<TData>)

    check(
      unwrappedOrderBy.key.toString() === this.table.primaryKey.toString() ||
        this.table.getIndexes().has(unwrappedOrderBy.key.toString()),
      `The index "${unwrappedOrderBy.key.toString()}" does not exist. You can only order by existing indexes or primary key.`,
    )

    const orderBy = unwrappedOrderByCompare(unwrappedOrderBy)
    const predicate = wherePredicate(args?.where)

    return [...this.table.rows.filter(predicate)].sort(orderBy)
  }

  async findMany(args?: FindManyArgs<TData>): Promise<Array<TData>> {
    return new Promise((resolve) => {
      resolve(this.syncFindMany(args))
    })
  }
}
