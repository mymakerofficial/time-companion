import type {
  DeleteProps,
  DeleteManyProps,
  FindProps,
  FindManyProps,
  InsertProps,
  InsertManyProps,
  QueryableTable,
  UpdateProps,
  UpdateManyProps,
} from '@shared/database/types/database'
import { firstOfOrNull } from '@shared/lib/utils/list'
import type { Nullable } from '@shared/lib/utils/types'
import type { TableAdapter } from '@shared/database/types/adapter'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'
import type { RawWhere, WhereBuilder } from '@shared/database/types/schema'
import { isNotDefined } from '@renderer/lib/utils'
import { isDefined } from '@shared/lib/utils/checks'

export class DatabaseTableBaseImpl<TData extends object>
  implements QueryableTable<TData>
{
  constructor(protected readonly tableAdapter: TableAdapter<TData>) {}

  protected getWhere(props?: {
    where?: WhereBuilder<TData> | RawWhere
  }): Nullable<RawWhere> {
    if (isNotDefined(props) || isNotDefined(props.where)) {
      return null
    }

    if (isDefined((props.where as WhereBuilder<TData>)._)) {
      return (props.where as WhereBuilder<TData>)._.raw
    }

    return props.where as RawWhere
  }

  async findFirst(props?: FindProps<TData>): Promise<Nullable<TData>> {
    const res = await this.findMany({ ...props, limit: 1, offset: 0 })

    return firstOfOrNull(res)
  }

  async findMany(props?: FindManyProps<TData>): Promise<Array<TData>> {
    return await this.tableAdapter.select({
      orderByColumn: getOrNull(props?.orderBy?.column.columnName),
      orderByTable: getOrNull(props?.orderBy?.column.tableName),
      oderByDirection: getOrDefault(props?.orderBy?.direction, 'asc'),
      where: this.getWhere(props),
      limit: getOrNull(props?.limit),
      offset: getOrNull(props?.offset),
    })
  }

  async update(props: UpdateProps<TData>): Promise<Nullable<TData>> {
    const res = await this.updateMany({
      ...props,
      limit: 1,
      offset: 0,
    })

    return firstOfOrNull(res)
  }

  async updateMany(props: UpdateManyProps<TData>): Promise<Array<TData>> {
    return await this.tableAdapter.update({
      data: props.data,
      orderByColumn: getOrNull(props?.orderBy?.column.columnName),
      orderByTable: getOrNull(props?.orderBy?.column.tableName),
      oderByDirection: getOrDefault(props?.orderBy?.direction, 'asc'),
      where: this.getWhere(props),
      limit: getOrNull(props.limit),
      offset: getOrNull(props.offset),
    })
  }

  async delete(props: DeleteProps<TData>): Promise<void> {
    return await this.deleteMany({
      ...props,
      limit: 1,
      offset: 0,
    })
  }

  async deleteMany(props: DeleteManyProps<TData>): Promise<void> {
    return await this.tableAdapter.delete({
      orderByColumn: getOrNull(props?.orderBy?.column.columnName),
      orderByTable: getOrNull(props?.orderBy?.column.tableName),
      oderByDirection: getOrDefault(props?.orderBy?.direction, 'asc'),
      where: this.getWhere(props),
      limit: getOrNull(props.limit),
      offset: getOrNull(props.offset),
    })
  }

  async deleteAll(): Promise<void> {
    return await this.tableAdapter.deleteAll()
  }

  async insert(args: InsertProps<TData>): Promise<TData> {
    return await this.tableAdapter.insert({
      data: args.data,
    })
  }

  async insertMany(args: InsertManyProps<TData>): Promise<Array<TData>> {
    return await this.tableAdapter.insertMany({
      data: args.data,
    })
  }
}
