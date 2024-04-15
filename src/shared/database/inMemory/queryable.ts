import type {
  FindArgs,
  FindManyArgs,
  Queryable,
} from '@shared/database/database'
import { firstOf } from '@shared/lib/utils/list'
import { wherePredicateFn } from '@shared/database/inMemory/wherePredicateFn'
import { orderByCompareFn } from '@shared/database/inMemory/orderByCompareFn'

export class InMemoryDatabaseQueryable<TData extends object>
  implements Queryable<TData>
{
  constructor(protected readonly tableData: Array<TData>) {}

  async findFirst(args?: FindArgs<TData>): Promise<TData> {
    return new Promise(async (resolve) => {
      resolve(firstOf(await this.findMany(args)))
    })
  }

  private syncFindMany(args: FindManyArgs<TData> = {}): Array<TData> {
    const { where, orderBy } = args

    return [
      ...this.tableData.filter((data) => wherePredicateFn(data, where)),
    ].sort((a, b) => orderByCompareFn(a, b, orderBy))
  }

  async findMany(args?: FindManyArgs<TData>): Promise<Array<TData>> {
    return new Promise((resolve) => {
      resolve(this.syncFindMany(args))
    })
  }
}
