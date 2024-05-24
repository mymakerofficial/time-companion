import type {
  DeleteProps,
  FindManyProps,
  FindProps,
  InsertManyProps,
  InsertProps,
  QueryableTable,
  UpdateProps,
} from '@shared/database/types/database'
import { firstOfOrNull } from '@shared/lib/utils/list'
import type { Nullable } from '@shared/lib/utils/types'
import type { QueryableTableAdapter } from '@shared/database/types/adapter'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'
import type { RawWhere, WhereBuilder } from '@shared/database/types/schema'
import { isNotDefined } from '@renderer/lib/utils'
import { isDefined } from '@shared/lib/utils/checks'

export class DatabaseQueryableTableImpl<TRow extends object>
  implements QueryableTable<TRow>
{
  constructor(protected readonly tableAdapter: QueryableTableAdapter<TRow>) {}

  protected getWhere(props?: {
    where?: WhereBuilder<TRow> | RawWhere
  }): Nullable<RawWhere> {
    if (isNotDefined(props) || isNotDefined(props.where)) {
      return null
    }

    if (isDefined((props.where as WhereBuilder<TRow>)._)) {
      return (props.where as WhereBuilder<TRow>)._.raw
    }

    return props.where as RawWhere
  }

  async findFirst(props?: FindProps<TRow>): Promise<Nullable<TRow>> {
    const res = await this.findMany({ ...props, limit: 1, offset: 0 })

    return firstOfOrNull(res)
  }

  async findMany(props?: FindManyProps<TRow>): Promise<Array<TRow>> {
    return await this.tableAdapter.select({
      orderByColumn: getOrNull(props?.orderBy?.column.columnName),
      orderByTable: getOrNull(props?.orderBy?.column.tableName),
      oderByDirection: getOrDefault(props?.orderBy?.direction, 'asc'),
      where: this.getWhere(props),
      limit: getOrNull(props?.limit),
      offset: getOrNull(props?.offset),
    })
  }

  async update(props: UpdateProps<TRow>): Promise<Array<TRow>> {
    return await this.tableAdapter.update({
      data: props.data,
      where: this.getWhere(props),
    })
  }

  async delete(props: DeleteProps<TRow>): Promise<void> {
    return await this.tableAdapter.delete({
      where: this.getWhere(props),
    })
  }

  async deleteAll(): Promise<void> {
    return await this.tableAdapter.deleteAll()
  }

  async insert(args: InsertProps<TRow>): Promise<TRow> {
    return await this.tableAdapter.insert({
      data: args.data,
    })
  }

  async insertMany(args: InsertManyProps<TRow>): Promise<Array<TRow>> {
    return await this.tableAdapter.insertMany({
      data: args.data,
    })
  }
}
