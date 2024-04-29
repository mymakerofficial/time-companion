import type {
  Database,
  Transaction,
  UpgradeFunction,
} from '@shared/database/database'
import type { DatabaseAdapter } from '@shared/database/adapter'
import { check, isNotNull, isNull } from '@shared/lib/utils/checks'
import { DatabaseTransactionImpl } from '@shared/database/impl/transaction'
import { DatabaseUpgradeTransactionImpl } from '@shared/database/impl/upgradeTransaction'

export function createDatabase(adapter: DatabaseAdapter): Database {
  return new DatabaseImpl(adapter)
}

export class DatabaseImpl implements Database {
  constructor(protected readonly adapter: DatabaseAdapter) {}

  protected async openVersionsIncrementally(
    name: string,
    openVersion: number,
    targetVersion: number,
    upgrade: UpgradeFunction,
  ): Promise<void> {
    const transaction = await this.adapter.openDatabase(name, openVersion)

    if (isNotNull(transaction)) {
      // TODO: this is repeated
      await upgrade(
        new DatabaseUpgradeTransactionImpl(transaction),
        openVersion,
        targetVersion - 1,
      )
        .catch(async (error) => {
          await transaction.rollback()
          throw error
        })
        .then(async () => {
          await transaction.commit()
        })
    }

    if (openVersion < targetVersion) {
      await this.adapter.closeDatabase()
      await this.openVersionsIncrementally(
        name,
        openVersion + 1,
        targetVersion,
        upgrade,
      )
    }
  }

  async open(
    name: string,
    version: number,
    upgrade: UpgradeFunction,
  ): Promise<void> {
    check(version >= 1, 'Database version must be greater than or equal to 1.')

    const databaseInfo = await this.adapter.getDatabaseInfo(name)

    if (isNull(databaseInfo)) {
      const transaction = await this.adapter.openDatabase(name, version)

      if (isNotNull(transaction)) {
        // TODO: this is repeated
        await upgrade(
          new DatabaseUpgradeTransactionImpl(transaction),
          version,
          0,
        )
          .catch(async (error) => {
            await transaction.rollback()
            throw error
          })
          .then(async () => {
            await transaction.commit()
          })
      }

      return
    }

    check(
      version >= databaseInfo.version,
      `Cannot open database at lower version. Current version is ${databaseInfo.version}, requested version is ${version}.`,
    )

    return await this.openVersionsIncrementally(
      name,
      databaseInfo.version,
      version,
      upgrade,
    )
  }

  async close(): Promise<void> {
    return await this.adapter.closeDatabase()
  }

  async delete(databaseName: string): Promise<void> {
    return await this.adapter.deleteDatabase(databaseName)
  }

  async withTransaction<TResult>(
    fn: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    const transaction = await this.adapter.openTransaction(
      await this.getTableNames(), // TODO this should be a parameter
      'readwrite', // TODO this should be a parameter
    )

    return await fn(new DatabaseTransactionImpl(transaction))
      .catch(async (error) => {
        await transaction.rollback()
        throw error
      })
      .then(async (result) => {
        await transaction.commit()
        return result
      })
  }

  async getTableNames(): Promise<Array<string>> {
    return await this.adapter.getTableNames()
  }

  async getTableIndexNames(tableName: string): Promise<Array<string>> {
    return await this.adapter.getTableIndexNames(tableName)
  }
}
