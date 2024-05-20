import type {
  Database,
  DatabaseConfig,
  DatabasePublisherEvent,
  DatabasePublisherTopics,
  MigrationFunction,
  Table,
  Transaction,
  UpgradeTransaction,
} from '@shared/database/types/database'
import type { DatabaseAdapter } from '@shared/database/types/adapter'
import { check, isNotNull, isString } from '@shared/lib/utils/checks'
import { DatabaseTransactionImpl } from '@shared/database/factory/transaction'
import { DatabaseUpgradeTransactionImpl } from '@shared/database/factory/upgradeTransaction'
import type {
  DatabaseSchema,
  InferTable,
  TableSchema,
} from '@shared/database/types/schema'
import { DatabaseTableImpl } from '@shared/database/factory/table'
import { getOrDefault } from '@shared/lib/utils/result'
import {
  OpenPublisherImpl,
  type SubscriberCallback,
} from '@shared/events/publisher'

export function createDatabase<TSchema extends DatabaseSchema>(
  adapter: DatabaseAdapter,
  config: DatabaseConfig<TSchema>,
): Database<TSchema> {
  return new DatabaseImpl(adapter, config)
}

export class DatabaseImpl<TSchema extends DatabaseSchema>
  implements Database<TSchema>
{
  protected _version: number = 0
  protected readonly publisher = new OpenPublisherImpl<
    DatabasePublisherTopics,
    DatabasePublisherEvent
  >()

  constructor(
    protected readonly adapter: DatabaseAdapter,
    protected readonly config: DatabaseConfig<TSchema>,
  ) {}

  get isOpen(): boolean {
    return this.adapter.isOpen
  }

  get version(): number {
    return this._version
  }

  protected get targetVersion(): number {
    return this.config.migrations.length + 1
  }

  protected async prepareMigration(
    version: number,
  ): Promise<MigrationFunction> {
    const fn = this.config.migrations[version - 1]

    if (fn.length === 0) {
      const module = await (
        fn as () => Promise<{ default: MigrationFunction }>
      )()
      return module.default
    }

    return fn as MigrationFunction
  }

  protected async runMigrations(
    migrations: Array<MigrationFunction>,
    transaction: UpgradeTransaction,
  ): Promise<void> {
    for (const migration of migrations) {
      await migration(transaction)
    }
  }

  async open(): Promise<void> {
    const info = await this.adapter.openDatabase()

    // 1 is the default if the database does not exist or has not been migrated yet
    const currentVersion = isNotNull(info) ? info.version : 1

    // the user facing version is always one less than the actual version
    this._version = currentVersion - 1

    check(currentVersion <= this.targetVersion, 'Database version is too high.')

    if (currentVersion < this.targetVersion) {
      this.publisher.notify({ type: 'migrationsStarted' }, {})

      // prepare all migrations between the current version and the target version
      const migrations = await Promise.all(
        Array.from(
          { length: this.targetVersion - currentVersion },
          (_, index) => this.prepareMigration(currentVersion + index),
        ),
      )

      const transactionAdapter = await this.adapter.openMigration(
        this.targetVersion,
      )

      const transaction: UpgradeTransaction =
        new DatabaseUpgradeTransactionImpl(transactionAdapter)

      try {
        await this.runMigrations(migrations, transaction)
        await transactionAdapter.commit()
        this.publisher.notify({ type: 'migrationsFinished' }, {})
      } catch (error) {
        await transactionAdapter.rollback()
        this.publisher.notify({ type: 'migrationFailed' }, {})
        throw error
      }
    } else {
      this.publisher.notify({ type: 'migrationsSkipped' }, {})
    }

    this._version = await this.adapter.getDatabaseInfo().then((info) => {
      return getOrDefault(info?.version, 1) - 1
    })
  }

  async close(): Promise<void> {
    return await this.adapter.closeDatabase().then(() => {
      this._version = 0
    })
  }

  async withTransaction<TResult>(
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

  onMigrationsStarted(
    callback: SubscriberCallback<
      DatabasePublisherTopics,
      DatabasePublisherEvent
    >,
  ): void {
    this.publisher.subscribe({ type: 'migrationsStarted' }, callback)
  }

  onMigrationsSkipped(
    callback: SubscriberCallback<
      DatabasePublisherTopics,
      DatabasePublisherEvent
    >,
  ): void {
    this.publisher.subscribe({ type: 'migrationsSkipped' }, callback)
  }

  onMigrationsFinished(
    callback: SubscriberCallback<
      DatabasePublisherTopics,
      DatabasePublisherEvent
    >,
  ): void {
    this.publisher.subscribe({ type: 'migrationsFinished' }, callback)
  }

  onMigrationsFailed(
    callback: SubscriberCallback<
      DatabasePublisherTopics,
      DatabasePublisherEvent
    >,
  ): void {
    this.publisher.subscribe({ type: 'migrationFailed' }, callback)
  }
}
