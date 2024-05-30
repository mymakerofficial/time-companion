import type {
  DeleteProps,
  FindManyProps,
  FindProps,
  InsertManyProps,
  InsertProps,
  Table,
  UpdateProps,
} from '@shared/database/types/database'
import type { TableAdapter } from '@shared/database/types/adapter'
import type { RawWhere, WhereBuilder } from '@shared/database/types/schema'
import type { Nullable } from '@shared/lib/utils/types'
import { isNotDefined } from '@renderer/lib/utils'
import { isDefined } from '@shared/lib/utils/checks'
import { firstOfOrNull } from '@shared/lib/utils/list'
import { getOrNull } from '@shared/lib/utils/result'

export class DatabaseTableImpl<TRow extends object> implements Table<TRow> {
  constructor(protected readonly tableAdapter: TableAdapter<TRow>) {}

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
      orderBy: getOrNull(props?.orderBy),
      range: getOrNull(props?.range),
      where: this.getWhere(props),
      limit: getOrNull(props?.limit),
      offset: getOrNull(props?.offset),
    })
  }

  async update(props: UpdateProps<TRow>): Promise<Array<TRow>> {
    return await this.tableAdapter.update({
      data: props.data,
      where: this.getWhere(props),
      range: getOrNull(props?.range),
    })
  }

  async delete(props: DeleteProps<TRow>): Promise<void> {
    return await this.tableAdapter.delete({
      where: this.getWhere(props),
      range: getOrNull(props?.range),
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
