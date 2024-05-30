import type {
  AdapterBaseQueryProps,
  AdapterDeleteProps,
  AdapterInsertManyProps,
  AdapterInsertProps,
  AdapterSelectProps,
  AdapterUpdateProps,
  TableAdapter,
} from '@shared/database/types/adapter'
import type { Knex } from 'knex'
import type { PGliteInterface, Transaction } from '@electric-sql/pglite'
import { buildQuery } from '@shared/database/adapters/pglite/helpers/queryBuilder'
import { handlePGliteError } from '@shared/database/adapters/pglite/helpers/errors'
import { firstOf } from '@shared/lib/utils/list'

export class PGLiteTableAdapter<TRow extends object>
  implements TableAdapter<TRow>
{
  constructor(
    protected readonly knex: Knex,
    protected readonly db: Transaction | PGliteInterface,
    protected readonly tableName: string,
  ) {}

  protected build(props: Partial<AdapterBaseQueryProps>) {
    return buildQuery(this.knex, this.tableName, props)
  }

  protected async query(builder: Knex.QueryBuilder) {
    const query = builder.toSQL().toNative()

    try {
      return await this.db.query<TRow>(query.sql, [...query.bindings])
    } catch (error) {
      handlePGliteError(error)
    }
  }

  async select(props: AdapterSelectProps<TRow>): Promise<Array<TRow>> {
    const builder = this.build(props).select(`${this.tableName}.*`)

    const res = await this.query(builder)

    return res.rows
  }

  async update(props: AdapterUpdateProps<TRow>): Promise<Array<TRow>> {
    const builder = this.build(props).update(props.data).returning('*')

    // TODO: make returning optional

    const res = await this.query(builder)

    return res.rows
  }

  async delete(props: AdapterDeleteProps<TRow>): Promise<void> {
    const builder = this.build(props).delete()

    await this.query(builder)
  }

  async deleteAll(): Promise<void> {
    const builder = this.knex.truncate().table(this.tableName)

    await this.query(builder)
  }

  async insert(props: AdapterInsertProps<TRow>): Promise<TRow> {
    const res = await this.insertMany({ data: [props.data] })

    return firstOf(res)
  }

  async insertMany(props: AdapterInsertManyProps<TRow>): Promise<Array<TRow>> {
    const builder = this.knex
      .insert(props.data)
      .into(this.tableName)
      .returning('*')

    // TODO: make returning optional

    const res = await this.query(builder)

    return res.rows
  }
}
