import type {
  Database,
  DatabaseConfig,
  DatabasePublisherEvent,
  DatabasePublisherTopics,
  MigrationFunction,
  Transaction,
  UnsafeDatabase,
  UpgradeTransaction,
} from '@shared/database/types/database'
import type { DatabaseAdapter } from '@shared/database/types/adapter'
import { check, isEmpty, isNotNull } from '@shared/lib/utils/checks'
import { DatabaseTransactionImpl } from '@shared/database/factory/transaction'
import { DatabaseUpgradeTransactionImpl } from '@shared/database/factory/upgradeTransaction'
import type {
  DatabaseSchema,
  TableSchema,
  TableSchemaRaw,
} from '@shared/database/types/schema'
import { getOrDefault } from '@shared/lib/utils/result'
import {
  OpenPublisherImpl,
  type SubscriberCallback,
} from '@shared/events/publisher'
import {
  DatabaseAlreadyOpenError,
  DatabaseVersionTooHighError,
} from '@shared/database/types/errors'
import { emptyMap, toArray } from '@shared/lib/utils/list'
import { DatabaseQuertyFactoryImpl } from '@shared/database/factory/queryFactory'
import { entriesOf } from '@shared/lib/utils/object'

export function createDatabase<TSchema extends DatabaseSchema>(
  adapter: DatabaseAdapter,
  config: DatabaseConfig<TSchema>,
): Database<TSchema> {
  return new DatabaseImpl(adapter, config)
}

export class DatabaseImpl<TSchema extends DatabaseSchema>
  extends DatabaseQuertyFactoryImpl
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
  ) {
    super(adapter, emptyMap())
  }

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

  protected async migrate(): Promise<void> {
    const currentVersion = this.version + 1

    check(
      currentVersion <= this.targetVersion,
      () =>
        new DatabaseVersionTooHighError(
          currentVersion - 1,
          this.targetVersion - 1,
        ),
    )

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
        new DatabaseUpgradeTransactionImpl(
          transactionAdapter,
          this.runtimeSchema,
        )

      await this.runMigrations(migrations, transaction)
        .catch(async (error) => {
          await transactionAdapter.rollback()
          this.publisher.notify({ type: 'migrationFailed' }, {})
          throw error
        })
        .then(async () => {
          await transactionAdapter.commit()
          this.publisher.notify({ type: 'migrationsFinished' }, {})
        })
    } else {
      this.setRuntimeSchemaFromConfig()
      this.publisher.notify({ type: 'migrationsSkipped' }, {})
    }

    this._version = await this.adapter.getDatabaseInfo().then((info) => {
      return getOrDefault(info?.version, 1) - 1
    })
  }

  protected setRuntimeSchemaFromConfig(): void {
    this.runtimeSchema.clear()

    if (isEmpty(this.config.schema)) {
      return
    }

    entriesOf(this.config.schema).forEach(([tableName, tableSchema]) => {
      this.runtimeSchema.set(
        tableName as string,
        (tableSchema as TableSchema)._.raw,
      )
    })
  }

  async open(): Promise<void> {
    check(!this.isOpen, () => new DatabaseAlreadyOpenError())

    const info = await this.adapter.openDatabase()

    // 1 is the default if the database does not exist or has not been migrated yet
    const currentVersion = isNotNull(info) ? info.version : 1

    // the user facing version is always one less than the actual version
    this._version = currentVersion - 1

    await this.migrate()
  }

  async close(): Promise<void> {
    return await this.adapter.closeDatabase().then(() => {
      this.runtimeSchema.clear()
      this._version = 0
    })
  }

  async withTransaction<TResult>(
    block: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    const transaction = await this.adapter.openTransaction()

    return await block(
      new DatabaseTransactionImpl(transaction, this.runtimeSchema),
    )
      .catch(async (error) => {
        await transaction.rollback()
        throw error
      })
      .then(async (result) => {
        await transaction.commit()
        return result
      })
  }

  get unsafe(): UnsafeDatabase {
    return {
      dropSchema: async (): Promise<void> => {
        await this.adapter.dropSchema()
        this.runtimeSchema.clear()
        this._version = 0
      },

      migrate: (): Promise<void> => {
        return this.migrate()
      },

      runMigration: async (migrationFn: MigrationFunction): Promise<void> => {
        this.config.migrations.push(migrationFn)
        await this.migrate()
      },

      setMigrations: (migrations: DatabaseConfig<TSchema>['migrations']) => {
        this.config.migrations = migrations
      },

      setConfigSchema: (schema: DatabaseConfig<DatabaseSchema>['schema']) => {
        // @ts-expect-error
        this.config.schema = schema
      },

      getRuntimeSchema: (): Map<string, TableSchemaRaw> => {
        return new Map(this.runtimeSchema)
      },
    }
  }

  getTableNames(): Array<string> {
    return toArray(this.runtimeSchema.keys())
  }

  async getActualTableNames(): Promise<Array<string>> {
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
