import type {
  CreateTableArgs,
  UpgradeTable,
  UpgradeTransaction,
} from '@shared/database/types/database'
import { DatabaseTransactionImpl } from '@shared/database/factory/transaction'
import { DatabaseUpgradeTableImpl } from '@shared/database/factory/upgradeTable'
import type {
  DatabaseTableSchema,
  InferTableType,
} from '@shared/database/types/schema'
import { isString } from '@shared/lib/utils/checks'

export class DatabaseUpgradeTransactionImpl
  extends DatabaseTransactionImpl
  implements UpgradeTransaction
{
  async createTable<
    TData extends object = object,
    TSchema extends DatabaseTableSchema<TData> = DatabaseTableSchema<TData>,
  >(schema: TSchema): Promise<UpgradeTable<InferTableType<TSchema>>> {
    await this.transactionAdapter.createTable(
      schema._raw.tableName,
      schema._raw.primaryKey,
    )
    return this.table(schema)
  }

  table<
    TData extends object = object,
    TSchema extends DatabaseTableSchema<TData> = DatabaseTableSchema<TData>,
  >(table: TSchema | string): UpgradeTable<InferTableType<TSchema>> {
    const tableName = isString(table) ? table : table._raw.tableName

    const tableAdapter =
      this.transactionAdapter.getTable<InferTableType<TSchema>>(tableName)
    return new DatabaseUpgradeTableImpl(this.transactionAdapter, tableAdapter)
  }
}
