import type { UpgradeTransaction } from '@shared/database/types/database'
import { DatabaseTransactionImpl } from '@shared/database/factory/transaction'
import type {
  AlterTableBuilder,
  ColumnBuilder,
} from '@shared/database/types/schema'
import { defineTable } from '@shared/database/schema/defineTable'
import { AlterTableBuilderImpl } from '@shared/database/schema/alterTable'

export class DatabaseUpgradeTransactionImpl
  extends DatabaseTransactionImpl
  implements UpgradeTransaction
{
  async createTable<TRow extends object>(
    tableName: string,
    columns: {
      [K in keyof TRow]: ColumnBuilder<TRow[K]>
    },
  ): Promise<void> {
    const schema = defineTable(tableName, columns)
    await this.transactionAdapter.createTable(schema._.raw)
  }

  async dropTable(tableName: string): Promise<void> {
    await this.transactionAdapter.dropTable(tableName)
  }

  alterTable(
    tableName: string,
    block: (builder: AlterTableBuilder) => void,
  ): Promise<void> {
    const alterTableBuilder = new AlterTableBuilderImpl()
    block(alterTableBuilder)
    return this.transactionAdapter.alterTable(
      tableName,
      alterTableBuilder._.actions,
    )
  }
}
