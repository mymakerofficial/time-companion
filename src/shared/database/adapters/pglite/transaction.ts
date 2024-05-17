import type { Transaction } from '@electric-sql/pglite'
import type { TransactionAdapter } from '@shared/database/types/adapter'
import { noop } from '@shared/lib/utils/noop'
import type { Knex } from 'knex'
import type { TableSchemaRaw } from '@shared/database/types/schema'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { valuesOf } from '@shared/lib/utils/object'
import { genericTypeToPgType } from '@shared/database/adapters/pglite/helpers/genericTypeToPgType'
import { todo } from '@shared/lib/utils/todo'
import { PGLiteTableAdapterFactory } from '@shared/database/adapters/pglite/tableFactory'

export class PGLiteDatabaseTransactionAdapter
  extends PGLiteTableAdapterFactory
  implements TransactionAdapter
{
  constructor(
    protected readonly knex: Knex,
    protected readonly tx: Transaction,
    protected readonly close: () => void = noop,
  ) {
    super(knex, tx)
  }

  async createTable<TData extends object>(
    schema: TableSchemaRaw<TData>,
  ): Promise<void> {
    check(isNotNull(this.db), 'Database is not open.')
    const builder = this.knex.schema.createTable(
      schema.tableName,
      (tableBuilder) => {
        valuesOf(schema.columns).forEach((column) => {
          const columnBuilder = tableBuilder.specificType(
            column.columnName,
            genericTypeToPgType(column.dataType),
          )

          if (column.isPrimaryKey) {
            columnBuilder.primary()
          }

          if (column.isNullable) {
            columnBuilder.nullable()
          }

          if (column.isIndexed) {
            columnBuilder.index()
          }

          if (column.isUnique) {
            columnBuilder.unique()
          }
        })
      },
    )

    const queries = builder.toSQL()

    for (const query of queries) {
      await this.db.query(query.sql, [...query.bindings])
    }
  }

  deleteTable(): Promise<void> {
    check(isNotNull(this.db), 'Database is not open.')
    todo()
  }

  async commit(): Promise<void> {
    return new Promise((resolve) => {
      this.close()
      resolve()
    })
  }

  async rollback(): Promise<void> {
    await this.tx.rollback()
    this.close()
  }
}
