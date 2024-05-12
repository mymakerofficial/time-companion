import type { SchemaAdapter } from '@shared/database/types/adapter'
import { PGLiteTableAdapter } from '@shared/database/adapters/pglite/table'
import { todo } from '@shared/lib/utils/todo'
import type { PGliteInterface, Transaction } from '@electric-sql/pglite'
import type { Knex } from 'knex'
import { valuesOf } from '@shared/lib/utils/object'
import type { TableSchemaRaw } from '@shared/database/types/schema'
import { genericTypeToPgType } from '@shared/database/adapters/pglite/helpers/genericTypeToPgType'

export class PGLiteSchemaAdapter implements SchemaAdapter {
  constructor(
    protected readonly knex: Knex,
    protected readonly db: Transaction | PGliteInterface,
  ) {}

  getTable<TData extends object>(tableName: string) {
    return new PGLiteTableAdapter<TData>(this.knex, this.db, tableName)
  }

  async createTable<TData extends object>(
    schema: TableSchemaRaw<TData>,
  ): Promise<void> {
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
    todo()
  }
}
