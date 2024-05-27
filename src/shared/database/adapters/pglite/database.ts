import type {
  DatabaseAdapter,
  DatabaseInfo,
  TransactionAdapter,
} from '@shared/database/types/adapter'
import createKnex from 'knex'
import { PGlite, type PGliteInterface } from '@electric-sql/pglite'
import { check, isNotEmpty, isNotNull } from '@shared/lib/utils/checks'
import { PGLiteDatabaseTransactionAdapter } from '@shared/database/adapters/pglite/transaction'
import { PGLiteTableAdapterFactory } from '@shared/database/adapters/pglite/tableFactory'
import { asArray, firstOf } from '@shared/lib/utils/list'
import type { MaybePromise } from '@shared/lib/utils/types'

// TODO: PGlite is an ES module, but electron doesn't support ES modules

export function pgliteAdapter(dataDir?: string): DatabaseAdapter {
  return new PGLiteDatabaseAdapter(dataDir)
}

export class PGLiteDatabaseAdapter
  extends PGLiteTableAdapterFactory
  implements DatabaseAdapter
{
  constructor(protected readonly dataDir: string = 'memory://db') {
    super(
      createKnex({
        client: 'pg',
      }),
      null,
    )
  }

  get isOpen(): boolean {
    return isNotNull(this.db) && !this.db.closed
  }

  protected async init(): Promise<void> {
    this.db = new PGlite(this.dataDir)
    await this.db.waitReady
  }

  protected async runInitialUpgrade(): Promise<void> {
    check(isNotNull(this.db), 'Database is not open.')

    await this.db.query(
      this.knex.schema
        .createTable('__migrations__', (table) => {
          table.increments('id').primary()
          table.integer('version').notNullable()
        })
        .toQuery(),
    )

    await this.db.query(
      this.knex('__migrations__').insert({ version: 1 }).toQuery(),
    )
  }

  protected async getDatabaseVersion(): Promise<number> {
    check(isNotNull(this.db), 'Database is not open.')

    const res = await this.db.query<{
      version: number
    }>(
      this.knex
        .select('version')
        .from('__migrations__')
        .orderBy('version', 'desc')
        .limit(1)
        .toQuery(),
    )

    check(isNotEmpty(res.rows), 'Database version not found.')

    return firstOf(res.rows).version
  }

  async openDatabase(): Promise<DatabaseInfo> {
    await this.init()

    const tables = await this.getAllTables()

    if (tables.length === 0) {
      await this.runInitialUpgrade()
    }

    const version = await this.getDatabaseVersion()

    return {
      version,
    }
  }

  async closeDatabase(): Promise<void> {
    check(isNotNull(this.db), 'Database is not open.')
    await (this.db as PGliteInterface).close()
  }

  protected async getTransaction(
    onCommit?: () => MaybePromise<void>,
    onRollback?: () => MaybePromise<void>,
  ): Promise<TransactionAdapter> {
    return new Promise((resolveAdapter) => {
      check(isNotNull(this.db), 'Database is not open.')
      ;(this.db as PGliteInterface).transaction((tx) => {
        return new Promise((resolveTransaction) => {
          const adapter = new PGLiteDatabaseTransactionAdapter(
            this.knex,
            tx,
            () => resolveTransaction(null),
            onCommit,
            onRollback,
          )

          resolveAdapter(adapter)
        })
      })
    })
  }

  openMigration(targetVersion: number): Promise<TransactionAdapter> {
    return this.getTransaction(async () => {
      check(isNotNull(this.db), 'Database is not open.')

      await this.db.query(
        this.knex
          .insert({ version: targetVersion })
          .into('__migrations__')
          .toQuery(),
      )
    })
  }

  async openTransaction(): Promise<TransactionAdapter> {
    return await this.getTransaction()
  }

  async getDatabaseInfo(): Promise<DatabaseInfo> {
    const version = await this.getDatabaseVersion()

    return {
      version,
    }
  }

  protected async getAllTables(): Promise<Array<string>> {
    check(isNotNull(this.db), 'Database is not open.')
    check(
      this.knex.client.config.client === 'pg',
      'Getting all table names is currently only supported in PostgreSQL.',
    )

    const res = await this.db.query<{
      tablename: string
    }>(
      `
        select "tablename" 
        from "pg_catalog"."pg_tables" 
        where not "schemaname" = 'pg_catalog' 
          and not "schemaname" = 'information_schema'
      `,
    )

    return asArray(res.rows).map((row: any) => row.tablename)
  }

  async getTableNames(): Promise<Array<string>> {
    return (await this.getAllTables()).filter(
      (name) => !name.startsWith('__') && !name.endsWith('__'),
    )
  }

  async truncateDatabase(): Promise<void> {
    check(isNotNull(this.db), 'Database is not open.')

    await this.db.exec('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
    await this.runInitialUpgrade()
  }
}
