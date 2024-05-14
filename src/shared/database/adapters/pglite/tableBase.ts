import type {
  AdapterBaseQueryProps,
  AdapterDeleteProps,
  AdapterInsertManyProps,
  AdapterInsertProps,
  AdapterSelectProps,
  AdapterUpdateProps,
  TableBaseAdapter,
} from '@shared/database/types/adapter'
import type { PGliteInterface, Transaction } from '@electric-sql/pglite'
import type { Knex } from 'knex'
import { firstOf } from '@shared/lib/utils/list'
import { buildQuery } from '@shared/database/adapters/pglite/helpers/queryBuilder'

export class PGLiteTableBaseAdapter<TData extends object>
  implements TableBaseAdapter<TData>
{
  constructor(
    protected readonly knex: Knex,
    protected readonly db: Transaction | PGliteInterface,
    protected readonly tableName: string,
  ) {}

  protected build(options: AdapterBaseQueryProps<TData>) {
    return buildQuery(this.knex, this.tableName, options)
  }

  protected query(builder: Knex.QueryBuilder) {
    const query = builder.toSQL().toNative()

    return this.db.query<TData>(query.sql, [...query.bindings])
  }

  protected exec(builder: Knex.QueryBuilder) {
    const query = builder.toQuery()

    return this.db.exec(query)
  }

  async select(props: AdapterSelectProps<TData>): Promise<Array<TData>> {
    const builder = this.build(props).select('*')

    const res = await this.query(builder)

    return res.rows
  }

  async update(props: AdapterUpdateProps<TData>): Promise<Array<TData>> {
    const builder = this.build(props).update(props.data).returning('*')

    // TODO: make returning optional

    const res = await this.query(builder)

    return res.rows
  }

  async delete(props: AdapterDeleteProps<TData>): Promise<void> {
    const builder = this.build(props).delete()

    await this.query(builder)
  }

  async deleteAll(): Promise<void> {
    const builder = this.knex.truncate().table(this.tableName)

    await this.query(builder)
  }

  async insert(props: AdapterInsertProps<TData>): Promise<TData> {
    const res = await this.insertMany({ data: [props.data] })

    return firstOf(res)
  }

  async insertMany(
    props: AdapterInsertManyProps<TData>,
  ): Promise<Array<TData>> {
    const builder = this.knex
      .insert(props.data)
      .into(this.tableName)
      .returning('*')

    // TODO: make returning optional

    const res = await this.exec(builder)

    return firstOf(res).rows as Array<TData>
  }
}
