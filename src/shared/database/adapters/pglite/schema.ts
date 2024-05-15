import type { SchemaAdapter } from '@shared/database/types/adapter'
import { todo } from '@shared/lib/utils/todo'
import { valuesOf } from '@shared/lib/utils/object'
import type { TableSchemaRaw } from '@shared/database/types/schema'
import { genericTypeToPgType } from '@shared/database/adapters/pglite/helpers/genericTypeToPgType'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { PGLiteTableAdapterFactory } from '@shared/database/adapters/pglite/tableFactory'

export class PGLiteSchemaAdapter
  extends PGLiteTableAdapterFactory
  implements SchemaAdapter
{
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
}
