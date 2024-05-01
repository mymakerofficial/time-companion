import type {
  DeleteArgs,
  DeleteManyArgs,
  FindArgs,
  FindManyArgs,
  InsertArgs,
  InsertManyArgs,
  Table,
  UpdateArgs,
  UpdateManyArgs,
} from '@shared/database/database'
import type { DatabaseTableAdapter } from '@shared/database/adapter'
import { cursorIterator } from '@shared/database/impl/helpers/cursorIterator'
import { firstOf } from '@shared/lib/utils/list'
import { filteredIterator } from '@shared/database/impl/helpers/filteredIterator'
import { getOrDefault } from '@shared/lib/utils/result'
import { maybeUnwrapOrderBy } from '@shared/database/helpers/unwrapOrderBy'
import type { Nullable } from '@shared/lib/utils/types'
import { check, isNull } from '@shared/lib/utils/checks'

export class DatabaseTableImpl<TData extends object> implements Table<TData> {
  constructor(protected readonly tableAdapter: DatabaseTableAdapter<TData>) {}

  protected async openIterator(args?: FindManyArgs<TData>) {
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
    return filteredIterator(cursorIterator(cursor), args)
  }

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
    const iterator = await this.openIterator(args)

    const results = []
    for await (const cursor of iterator) {
      results.push(cursor.value())
    }

    return results
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
}
