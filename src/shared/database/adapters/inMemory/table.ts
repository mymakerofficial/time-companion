import type {
  DeleteArgs,
  DeleteManyArgs,
  InsertArgs,
  InsertManyArgs,
  Table,
  UpdateArgs,
  UpdateManyArgs,
} from '@shared/database/database'
import { InMemoryDatabaseQueryable } from '@shared/database/adapters/inMemory/queryable'
import { wherePredicateFn } from '@shared/database/helpers/wherePredicateFn'
import { check, isNotNull } from '@shared/lib/utils/checks'

export class InMemoryDatabaseTable<TData extends object>
  extends InMemoryDatabaseQueryable<TData>
  implements Table<TData>
{
  private syncCreate(args: InsertArgs<TData>): TData {
    this.table.rows.push(args.data)
    return args.data
  }

  async insert(args: InsertArgs<TData>): Promise<TData> {
    return new Promise((resolve) => {
      resolve(this.syncCreate(args))
    })
  }

  async insertMany(args: InsertManyArgs<TData>): Promise<Array<TData>> {
    return new Promise(async (resolve) => {
      resolve(await Promise.all(args.data.map((data) => this.insert({ data }))))
    })
  }

  private syncUpdate(args: UpdateArgs<TData>): TData {
    const { where, data } = args

    const index = this.table.rows.findIndex((item) =>
      wherePredicateFn(item, where),
    )

    check(index !== -1, 'No item found to update.')

    this.table.rows[index] = { ...this.table.rows[index], ...data }

    return this.table.rows[index]
  }

  async update(args: UpdateArgs<TData>): Promise<TData> {
    return new Promise((resolve) => {
      resolve(this.syncUpdate(args))
    })
  }

  private syncUpdateMany(args: UpdateManyArgs<TData>): Array<TData> {
    const { where, data } = args

    const indexes = this.table.rows
      .map((item, index) => (wherePredicateFn(item, where) ? index : null))
      .filter((index) => isNotNull(index)) as Array<number>

    check(indexes.length > 0, 'No items found to update.')

    indexes.forEach((index) => {
      this.table.rows[index] = { ...this.table.rows[index], ...data }
    })

    return indexes.map((index) => this.table.rows[index])
  }

  async updateMany(args: UpdateManyArgs<TData>): Promise<Array<TData>> {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.syncUpdateMany(args))
      } catch (error) {
        reject(error)
      }
    })
  }

  private syncDelete(args: DeleteArgs<TData>): void {
    const { where } = args

    const index = this.table.rows.findIndex((item) =>
      wherePredicateFn(item, where),
    )

    check(index !== -1, 'No item found to delete.')

    this.table.rows.splice(index, 1)
  }

  async delete(args: DeleteArgs<TData>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.syncDelete(args)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  private syncDeleteMany(args: DeleteManyArgs<TData>): void {
    const { where } = args

    const indexes = this.table.rows
      .map((item, index) => (wherePredicateFn(item, where) ? index : null))
      .filter((index) => isNotNull(index)) as Array<number>

    check(indexes.length > 0, 'No items found to delete.')

    indexes.forEach((index) => {
      this.table.rows.splice(index, 1)
    })
  }

  async deleteMany(args: DeleteManyArgs<TData>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.syncDeleteMany(args)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  async deleteAll(): Promise<void> {
    return new Promise((resolve) => {
      this.table.rows = []
      resolve()
    })
  }
}
