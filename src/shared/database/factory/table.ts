import type {
  DeleteProps,
  FindManyProps,
  FindProps,
  InsertManyProps,
  InsertProps,
  Table,
  UpdateProps,
} from '@database/types/database'
import type { TableAdapter } from '@database/types/adapter'
import type {
  RawWhere,
  TableSchemaRaw,
  WhereBuilder,
} from '@database/types/schema'
import type { Nullable } from '@shared/lib/utils/types'
import { isNotDefined } from '@renderer/lib/utils'
import { isDefined, isUndefined } from '@shared/lib/utils/checks'
import { firstOfOrNull } from '@shared/lib/utils/list'
import { getOrNull } from '@shared/lib/utils/result'
import { keysOf } from '@shared/lib/utils/object'

export class DatabaseTableImpl<TRow extends object> implements Table<TRow> {
  constructor(
    protected readonly tableAdapter: TableAdapter<TRow>,
    protected readonly tableSchema?: TableSchemaRaw<TRow>,
  ) {}

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

  async findFirst<TReturn extends object = TRow>(
    props?: FindProps<TRow, TReturn>,
  ): Promise<Nullable<TReturn>> {
    const res = await this.findMany({ ...props, limit: 1, offset: 0 })

    return firstOfOrNull(res)
  }

  async findMany<TReturn extends object = TRow>(
    props: FindManyProps<TRow, TReturn> = {},
  ): Promise<Array<TReturn>> {
    const res = await this.tableAdapter.select({
      orderBy: getOrNull(props.orderBy),
      range: getOrNull(props.range),
      where: this.getWhere(props),
      limit: getOrNull(props.limit),
      offset: getOrNull(props.offset),
    })

    if (isDefined(props.map)) {
      return res.map(props.map)
    }

    return res as unknown as Array<TReturn>
  }

  async update<TReturn extends object = TRow>(
    props: UpdateProps<TRow, TReturn>,
  ): Promise<Array<TReturn>> {
    const res = await this.tableAdapter.update({
      data: props.data,
      where: this.getWhere(props),
      range: getOrNull(props?.range),
    })

    if (isDefined(props.map)) {
      return res.map(props.map)
    }

    return res as unknown as Array<TReturn>
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

  async insert<TReturn extends object = TRow>(
    props: InsertProps<TRow, TReturn>,
  ): Promise<TReturn> {
    const res = await this.tableAdapter.insert({
      data: props.data,
    })

    if (isDefined(props.map)) {
      return props.map(res)
    }

    return res as unknown as TReturn
  }

  async insertMany<TReturn extends object = TRow>(
    props: InsertManyProps<TRow, TReturn>,
  ): Promise<Array<TReturn>> {
    const res = await this.tableAdapter.insertMany({
      data: props.data,
    })

    if (isDefined(props.map)) {
      return res.map(props.map)
    }

    return res as unknown as Array<TReturn>
  }

  getColumnNames(): Array<string> {
    if (isUndefined(this.tableSchema)) {
      return []
    }

    return keysOf(this.tableSchema.columns) as Array<string>
  }
}
