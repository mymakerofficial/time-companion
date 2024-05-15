import type {
  Database,
  Table,
  Transaction,
  UpgradeFunction,
} from '@shared/database/types/database'
import type {
  DatabaseAdapter,
  DatabaseInfo,
} from '@shared/database/types/adapter'
import {
  check,
  isArray,
  isNotEmpty,
  isNotNull,
  isNull,
  isString,
} from '@shared/lib/utils/checks'
import { DatabaseTransactionImpl } from '@shared/database/factory/transaction'
import { DatabaseUpgradeTransactionImpl } from '@shared/database/factory/upgradeTransaction'
import { getOrDefault } from '@shared/lib/utils/result'
import type { InferTable, TableSchema } from '@shared/database/types/schema'
import { DatabaseTableImpl } from '@shared/database/factory/table'

export function createDatabase(adapter: DatabaseAdapter): Database {
  return new DatabaseImpl(adapter)
}

export class DatabaseImpl implements Database {
  constructor(protected readonly adapter: DatabaseAdapter) {}

  get isOpen(): boolean {
    return this.adapter.isOpen
  }

  async open(
    name: string,
    version: number,
    upgrade: UpgradeFunction,
  ): Promise<void> {
    check(version >= 1, 'Database version must be greater than or equal to 1.')

    // const databaseInfo = await this.adapter.getDatabaseInfo(name)
    //
    // check(
    //   isNull(databaseInfo) || version >= databaseInfo.version,
    //   `Cannot open database at lower version. Current version is "${databaseInfo?.version}", requested version is "${version}".`,
    // )

    const transactionAdapter = await this.adapter.openDatabase(name, version)

    if (isNotNull(transactionAdapter)) {
      const currentVersion = 0 // getOrDefault(databaseInfo?.version, 0)

      // call upgrade function for each version between and including the current version and the target version

      for (
        let newVersion = currentVersion + 1;
        newVersion <= version;
        newVersion++
      ) {
        await upgrade(
          new DatabaseUpgradeTransactionImpl(transactionAdapter),
          newVersion,
          newVersion - 1,
        )
      }

      await transactionAdapter.commit()
    }
  }

  async close(): Promise<void> {
    return await this.adapter.closeDatabase()
  }

  protected async runTransaction<TResult>(
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    const transaction = await this.adapter.openTransaction()

    return await block(new DatabaseTransactionImpl(transaction))
      .catch(async (error) => {
        await transaction.rollback()
        throw error
      })
      .then(async (result) => {
        await transaction.commit()
        return result
      })
  }

  async withTransaction<TResult>(
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    return await this.runTransaction(block)
  }

  table<
    TData extends object = object,
    TSchema extends TableSchema<TData> = TableSchema<TData>,
  >(table: TSchema | string): Table<InferTable<TSchema>> {
    const tableName = isString(table) ? table : table._.raw.tableName

    const tableAdapter = this.adapter.getTable<InferTable<TSchema>>(tableName)
    return new DatabaseTableImpl(tableAdapter)
  }

  async getTableNames(): Promise<Array<string>> {
    return await this.adapter.getTableNames()
  }

  async delete(databaseName: string): Promise<void> {
    return await this.adapter.deleteDatabase(databaseName)
  }

  async getDatabases(): Promise<Array<DatabaseInfo>> {
    return await this.adapter.getDatabases()
  }

  async getTableIndexNames(tableName: string): Promise<Array<string>> {
    return await this.adapter.getTableIndexNames(tableName)
  }
}
