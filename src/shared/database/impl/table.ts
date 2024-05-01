import type {
  DeleteArgs,
  DeleteManyArgs,
  InsertArgs,
  InsertManyArgs,
  JoinedTable,
  LeftJoinArgs,
  Table,
  UpdateArgs,
  UpdateManyArgs,
} from '@shared/database/database'
import { firstOf } from '@shared/lib/utils/list'
import { DatabaseJoinedTableImpl } from '@shared/database/impl/joinedTable'
import { DatabaseQueryableImpl } from '@shared/database/impl/queryable'
import type {
  DatabaseTableAdapter,
  DatabaseTransactionAdapter,
} from '@shared/database/adapter'

export class DatabaseTableImpl<TData extends object>
  extends DatabaseQueryableImpl<TData>
  implements Table<TData>
{
  constructor(
    protected readonly transactionAdapter: DatabaseTransactionAdapter,
    protected readonly tableAdapter: DatabaseTableAdapter<TData>,
  ) {
    super(tableAdapter)
  }

  async update(args: UpdateArgs<TData>): Promise<TData> {
    return firstOf(
      await this.updateMany({
        ...args,
        limit: 1,
        offset: 0,
      }),
    )
  }

  async updateMany(args: UpdateManyArgs<TData>): Promise<Array<TData>> {
    const iterator = await this.openIterator(args)

    const results = []
    for await (const cursor of iterator) {
      cursor.update(args.data)
      results.push(cursor.value())
    }

    return results
  }

  async delete(args: DeleteArgs<TData>): Promise<void> {
    await this.deleteMany({
      ...args,
      limit: 1,
      offset: 0,
    })
  }

  async deleteMany(args: DeleteManyArgs<TData>): Promise<void> {
    const iterator = await this.openIterator(args)

    for await (const cursor of iterator) {
      cursor.delete()
    }
  }

  async deleteAll(): Promise<void> {
    await this.tableAdapter.deleteAll()
  }

  async insert(args: InsertArgs<TData>): Promise<TData> {
    await this.tableAdapter.insert(args.data)
    return args.data
  }

  insertMany(args: InsertManyArgs<TData>): Promise<Array<TData>> {
    return new Promise((resolve) => {
      args.data.forEach(async (data) => {
        await this.tableAdapter.insert(data)
      })
      resolve(args.data)
    })
  }

  leftJoin<TRightData extends object>(
    rightTableName: string,
    args: LeftJoinArgs<TData, TRightData>,
  ): JoinedTable<TData, TRightData> {
    const rightTableAdapter =
      this.transactionAdapter.getTable<TRightData>(rightTableName)

    return new DatabaseJoinedTableImpl(
      this.tableAdapter,
      rightTableAdapter,
      args,
    )
  }
}
