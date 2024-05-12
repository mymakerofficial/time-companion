import type {
  AdapterInsertManyOptions,
  AdapterInsertOptions,
  AdapterSelectOptions,
  AdapterUpdateOptions,
  TableBaseAdapter,
} from '@shared/database/types/adapter'
import type { PGliteInterface, Transaction } from '@electric-sql/pglite'
import type { Knex } from 'knex'
import { isNotNull } from '@shared/lib/utils/checks'
import { firstOf } from '@shared/lib/utils/list'

export class PGLiteTableBaseAdapter<TData extends object>
  implements TableBaseAdapter<TData>
{
  constructor(
    protected readonly knex: Knex,
    protected readonly db: Transaction | PGliteInterface,
    protected readonly tableName: string,
  ) {}

  protected build(options: AdapterSelectOptions<TData>) {
    const builder = this.knex.table(this.tableName)

    if (isNotNull(options.limit)) {
      builder.limit(options.limit)
    }

    if (isNotNull(options.offset)) {
      builder.offset(options.offset)
    }

    return builder
  }

  protected query(builder: Knex.QueryBuilder) {
    const query = builder.toSQL().toNative()

    return this.db.query<TData>(query.sql, [...query.bindings]).catch((err) => {
      throw new Error(`${err.message}; "${query.sql}"`)
    })
  }

  protected exec(builder: Knex.QueryBuilder) {
    return this.db.exec(builder.toString())
  }

  async select(options: AdapterSelectOptions<TData>): Promise<Array<TData>> {
    const builder = this.build(options).select('*')

    const res = await this.query(builder)

    return res.rows
  }

  async update(options: AdapterUpdateOptions<TData>): Promise<Array<TData>> {
    const builder = this.build(options).update(options.data)

    const res = await this.query(builder)

    return res.rows
  }

  async delete(options: AdapterSelectOptions<TData>): Promise<void> {
    const builder = this.build(options).delete()

    await this.query(builder)
  }

  async deleteAll(): Promise<void> {
    const builder = this.knex.truncate().table(this.tableName)

    await this.query(builder)
  }

  async insert(options: AdapterInsertOptions<TData>): Promise<TData> {
    const res = await this.insertMany({ data: [options.data] })

    return firstOf(res)
  }

  async insertMany(
    options: AdapterInsertManyOptions<TData>,
  ): Promise<Array<TData>> {
    const builder = this.knex
      .insert(options.data)
      .into(this.tableName)
      .returning('*')

    const res = await this.exec(builder)

    return firstOf(res).rows as Array<TData>
  }
}
