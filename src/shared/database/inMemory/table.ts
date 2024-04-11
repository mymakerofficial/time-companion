import type {
  CreateArgs,
  CreateManyArgs,
  DeleteArgs,
  DeleteManyArgs,
  Table,
  UpdateArgs,
  UpdateManyArgs,
} from '@shared/database/database'
import { InMemoryDatabaseQueryable } from '@shared/database/inMemory/queryable'
import { wherePredicateFn } from '@shared/database/inMemory/wherePredicateFn'
import { check, isNotNull } from '@shared/lib/utils/checks'

export class InMemoryDatabaseTable<TData extends object>
  extends InMemoryDatabaseQueryable<TData>
  implements Table<TData>
{
  async create(args: CreateArgs<TData>): Promise<TData> {
    this.tableData.push(args.data)
    return args.data
  }

  async createMany(args: CreateManyArgs<TData>): Promise<Array<TData>> {
    return await Promise.all(args.data.map((data) => this.create({ data })))
  }

  async update(args: UpdateArgs<TData>): Promise<TData> {
    const { where, data } = args

    const index = this.tableData.findIndex((item) =>
      wherePredicateFn(item, where),
    )

    check(index !== -1, 'No item found to update.')

    this.tableData[index] = { ...this.tableData[index], ...data }

    return this.tableData[index]
  }

  async updateMany(args: UpdateManyArgs<TData>): Promise<Array<TData>> {
    const { where, data } = args

    const indexes = this.tableData
      .map((item, index) => (wherePredicateFn(item, where) ? index : null))
      .filter((index) => isNotNull(index)) as Array<number>

    check(indexes.length > 0, 'No items found to update.')

    indexes.forEach((index) => {
      this.tableData[index] = { ...this.tableData[index], ...data }
    })

    return indexes.map((index) => this.tableData[index])
  }

  async delete(args: DeleteArgs<TData>): Promise<void> {
    const { where } = args

    const index = this.tableData.findIndex((item) =>
      wherePredicateFn(item, where),
    )

    check(index !== -1, 'No item found to delete.')

    this.tableData.splice(index, 1)
  }

  async deleteMany(args: DeleteManyArgs<TData>): Promise<void> {
    const { where } = args

    const indexes = this.tableData
      .map((item, index) => (wherePredicateFn(item, where) ? index : null))
      .filter((index) => isNotNull(index)) as Array<number>

    check(indexes.length > 0, 'No items found to delete.')

    indexes.forEach((index) => {
      this.tableData.splice(index, 1)
    })
  }
}
