import type {
  Database,
  Transaction,
  UpgradeFunction,
} from '@shared/database/types/database'
import type {
  DatabaseAdapter,
  DatabaseInfo,
} from '@shared/database/types/adapter'
import { check, isNotNull, isNull } from '@shared/lib/utils/checks'
import { DatabaseTransactionImpl } from '@shared/database/factory/transaction'
import { DatabaseUpgradeTransactionImpl } from '@shared/database/factory/upgradeTransaction'
import { getOrDefault } from '@shared/lib/utils/result'

export function createDatabase(adapter: DatabaseAdapter): Database {
  return new DatabaseImpl(adapter)
}

export class DatabaseImpl implements Database {
  constructor(protected readonly adapter: DatabaseAdapter) {}

  async open(
    name: string,
    version: number,
    upgrade: UpgradeFunction,
  ): Promise<void> {
    check(version >= 1, 'Database version must be greater than or equal to 1.')

    const databaseInfo = await this.adapter.getDatabaseInfo(name)

    check(
      isNull(databaseInfo) || version >= databaseInfo.version,
      `Cannot open database at lower version. Current version is "${databaseInfo?.version}", requested version is "${version}".`,
    )

    await this.adapter.openDatabase(
      name,
      version,
      async (transactionAdapter) => {
        const currentVersion = getOrDefault(databaseInfo?.version, 0)

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
      },
    )
  }

  async close(): Promise<void> {
    return await this.adapter.closeDatabase()
  }

  async delete(databaseName: string): Promise<void> {
    return await this.adapter.deleteDatabase(databaseName)
  }

  protected async runTransaction<TResult>(
    tableNames: Array<string>,
    mode: 'readonly' | 'readwrite',
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
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
    tableNames: Array<string>,
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    return await this.withReadTransaction(tableNames, block)
  }

  async withWriteTransaction<TResult>(
    tableNames: Array<string>,
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    return await this.runTransaction(tableNames, 'readwrite', block)
  }

  async withReadTransaction<TResult>(
    tableNames: Array<string>,
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    return await this.runTransaction(tableNames, 'readonly', block)
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
