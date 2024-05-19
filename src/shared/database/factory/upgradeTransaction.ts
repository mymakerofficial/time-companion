import type { UpgradeTransaction } from '@shared/database/types/database'
import { DatabaseTransactionImpl } from '@shared/database/factory/transaction'
import type { ColumnBuilder, TableSchema } from '@shared/database/types/schema'
import { defineTable } from '@shared/database/schema/defineTable'
import { todo } from '@shared/lib/utils/todo'

export class DatabaseUpgradeTransactionImpl
  extends DatabaseTransactionImpl
  implements UpgradeTransaction
{
  async createTable<TRow extends object>(
    tableName: string,
    columns: {
      [K in keyof TRow]: ColumnBuilder<TRow[K]>
    },
  ): Promise<TableSchema<TRow>> {
    const schema = defineTable(tableName, columns)
    await this.transactionAdapter.createTable(schema._.raw)
    return schema
  }

  dropTable(tableName: string): Promise<void> {
    todo()
  }
}
