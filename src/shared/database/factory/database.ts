import type {
  Database,
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
import type { TableSchema } from '@shared/database/types/schema'

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

  async delete(databaseName: string): Promise<void> {
    return await this.adapter.deleteDatabase(databaseName)
  }

  protected async runTransaction<TResult>(
    tables: Array<TableSchema<object>> | Array<string>,
    mode: 'readonly' | 'readwrite',
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    check(isArray(tables), 'Tables must be an array.')
    check(isNotEmpty(tables), 'Cannot open transaction without tables.')

    const tableNames = tables.map((table) =>
      isString(table) ? table : table._.raw.tableName,
    )

    const transaction = await this.adapter.openTransaction(tableNames, mode)

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
    tables: Array<TableSchema<object>> | Array<string>,
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    return await this.withReadTransaction(tables, block)
  }

  async withWriteTransaction<TResult>(
    tables: Array<TableSchema<object>> | Array<string>,
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    return await this.runTransaction(tables, 'readwrite', block)
  }

  async withReadTransaction<TResult>(
    tables: Array<TableSchema<object>> | Array<string>,
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    return await this.runTransaction(tables, 'readonly', block)
  }

  async getDatabases(): Promise<Array<DatabaseInfo>> {
    return await this.adapter.getDatabases()
  }

  async getTableNames(): Promise<Array<string>> {
    return await this.adapter.getTableNames()
  }

  async getTableIndexNames(tableName: string): Promise<Array<string>> {
    return await this.adapter.getTableIndexNames(tableName)
  }
}
