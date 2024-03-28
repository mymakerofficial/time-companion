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
  tableData: Array<TData> = []

  constructor(tableData: Array<TData>) {
    this.tableData = tableData
  }

  async findFirst(args?: FindArgs<TData>): Promise<TData> {
    return firstOf(await this.findMany(args))
  }

  async findMany(args: FindManyArgs<TData> = {}): Promise<Array<TData>> {
    const { where, orderBy } = args

    return [
      ...this.tableData.filter((data) => wherePredicateFn(data, where)),
    ].sort((a, b) => orderByCompareFn(a, b, orderBy))
  }
}