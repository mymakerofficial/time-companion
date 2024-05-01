import { DatabaseQueryableImpl } from '@shared/database/factory/queryable'
import type {
  DeleteArgs,
  DeleteManyArgs,
  InsertArgs,
  InsertManyArgs,
  UpdateArgs,
  UpdateManyArgs,
} from '@shared/database/types/database'
import { firstOfOrNull } from '@shared/lib/utils/list'
import type { Nullable } from '@shared/lib/utils/types'

export class DatabaseTableBaseImpl<
  TData extends object,
> extends DatabaseQueryableImpl<TData> {
  async update(args: UpdateArgs<TData>): Promise<Nullable<TData>> {
    return firstOfOrNull(
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
}
