import type {
  FindArgs,
  FindManyArgs,
  Queryable,
} from '@shared/database/database'
import { firstOf } from '@shared/lib/utils/list'
import type { InMemoryDataTable } from '@shared/database/adapters/inMemory/helpers/dataTable'
import { wherePredicate } from '@shared/database/helpers/wherePredicate'
import { orderByCompare } from '@shared/database/helpers/orderByCompare'

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
    const { where, orderBy } = args

    return [...this.table.rows.filter(wherePredicate(where))].sort(
      orderByCompare(orderBy),
    )
  }

  async findMany(args?: FindManyArgs<TData>): Promise<Array<TData>> {
    return new Promise((resolve) => {
      resolve(this.syncFindMany(args))
    })
  }
}
