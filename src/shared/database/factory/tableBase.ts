import type {
  DeleteArgs,
  DeleteManyArgs,
  FindArgs,
  FindManyArgs,
  InsertArgs,
  InsertManyArgs,
  TableBase,
  UpdateArgs,
  UpdateManyArgs,
} from '@shared/database/types/database'
import { firstOfOrNull } from '@shared/lib/utils/list'
import type { Nullable } from '@shared/lib/utils/types'
import type { TableAdapter } from '@shared/database/types/adapter'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'
import type { RawWhere, WhereBuilder } from '@shared/database/types/schema'
import { isNotDefined } from '@renderer/lib/utils'
import { isDefined } from '@shared/lib/utils/checks'

export class DatabaseTableBaseImpl<TData extends object>
  implements TableBase<TData>
{
  constructor(protected readonly tableAdapter: TableAdapter<TData>) {}

  protected getWhere(args?: {
    where?: WhereBuilder<TData> | RawWhere
  }): Nullable<RawWhere> {
    if (isNotDefined(args) || isNotDefined(args.where)) {
      return null
    }

    if (isDefined((args.where as WhereBuilder<TData>)._)) {
      return (args.where as WhereBuilder<TData>)._.raw
    }

    return args.where as RawWhere
  }

  async findFirst(args?: FindArgs<TData>): Promise<Nullable<TData>> {
    const res = await this.findMany({ ...args, limit: 1, offset: 0 })

    return firstOfOrNull(res)
  }

  async findMany(args?: FindManyArgs<TData>): Promise<Array<TData>> {
    return await this.tableAdapter.select({
      orderByColumn: getOrNull(args?.orderBy?.column.columnName),
      orderByTable: getOrNull(args?.orderBy?.column.tableName),
      oderByDirection: getOrDefault(args?.orderBy?.direction, 'asc'),
      where: this.getWhere(args),
      limit: getOrNull(args?.limit),
      offset: getOrNull(args?.offset),
    })
  }

  async update(args: UpdateArgs<TData>): Promise<Nullable<TData>> {
    const res = await this.updateMany({
      ...args,
      limit: 1,
      offset: 0,
    })

    return firstOfOrNull(res)
  }

  async updateMany(args: UpdateManyArgs<TData>): Promise<Array<TData>> {
    return await this.tableAdapter.update({
      data: args.data,
      orderByColumn: getOrNull(args?.orderBy?.column.columnName),
      orderByTable: getOrNull(args?.orderBy?.column.tableName),
      oderByDirection: getOrDefault(args?.orderBy?.direction, 'asc'),
      where: this.getWhere(args),
      limit: getOrNull(args.limit),
      offset: getOrNull(args.offset),
    })
  }

  async delete(args: DeleteArgs<TData>): Promise<void> {
    return await this.deleteMany({
      ...args,
      limit: 1,
      offset: 0,
    })
  }

  async deleteMany(args: DeleteManyArgs<TData>): Promise<void> {
    return await this.tableAdapter.delete({
      orderByColumn: getOrNull(args?.orderBy?.column.columnName),
      orderByTable: getOrNull(args?.orderBy?.column.tableName),
      oderByDirection: getOrDefault(args?.orderBy?.direction, 'asc'),
      where: this.getWhere(args),
      limit: getOrNull(args.limit),
      offset: getOrNull(args.offset),
    })
  }

  async deleteAll(): Promise<void> {
    return await this.tableAdapter.deleteAll()
  }

  async insert(args: InsertArgs<TData>): Promise<TData> {
    return await this.tableAdapter.insert({
      data: args.data,
    })
  }

  async insertMany(args: InsertManyArgs<TData>): Promise<Array<TData>> {
    return await this.tableAdapter.insertMany({
      data: args.data,
    })
  }
}
