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
import { todo } from '@shared/lib/utils/todo'
import { cursorIterator } from '@shared/database/impl/helpers/cursorIterator'

export class DatabaseTableImpl<TData extends object> implements Table<TData> {
  constructor(protected readonly tableAdapter: DatabaseTableAdapter<TData>) {}

  async findFirst(args?: FindArgs<TData>): Promise<TData> {
    todo()
  }

  async findMany(args?: FindManyArgs<TData>): Promise<Array<TData>> {
    const cursor = await this.tableAdapter.openCursor(null, 'next')
    const iterator = cursorIterator(cursor)

    const results = []
    for await (const cursor of iterator) {
      results.push(cursor.value())
    }

    return results
  }

  update(args: UpdateArgs<TData>): Promise<TData> {
    todo()
  }

  updateMany(args: UpdateManyArgs<TData>): Promise<Array<TData>> {
    todo()
  }

  delete(args: DeleteArgs<TData>): Promise<void> {
    todo()
  }

  deleteMany(args: DeleteManyArgs<TData>): Promise<void> {
    todo()
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
