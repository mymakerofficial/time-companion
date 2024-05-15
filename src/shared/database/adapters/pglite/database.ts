import type {
  DatabaseAdapter,
  DatabaseInfo,
  TransactionAdapter,
} from '@shared/database/types/adapter'
import type { Knex } from 'knex'
import createKnex from 'knex'
import {
  PGlite,
  type PGliteInterface,
  type Transaction,
} from '@electric-sql/pglite'
import type { Nullable } from '@shared/lib/utils/types'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { PGLiteDatabaseTransactionAdapter } from '@shared/database/adapters/pglite/transaction'
import path from 'path'
import { todo } from '@shared/lib/utils/todo'
import { getOrDefault } from '@shared/lib/utils/result'
import { PGLiteSchemaAdapter } from '@shared/database/adapters/pglite/schema'
import { PGLiteTableAdapterFactory } from '@shared/database/adapters/pglite/tableFactory'

export function pgliteAdapter(): DatabaseAdapter {
  return new PGLiteDatabaseAdapter()
}

export class PGLiteDatabaseAdapter
  extends PGLiteTableAdapterFactory
  implements DatabaseAdapter
{
  constructor(
    protected readonly protocol: string = 'memory',
    protected readonly basePath: string = '',
  ) {
    super(
      createKnex({
        client: 'pg',
      }),
      null,
    )
  }

  protected getDataDir(databaseName: string): string {
    return `${this.protocol}://${path.join(this.basePath, databaseName)}`
  }

  get isOpen(): boolean {
    return isNotNull(this.db) && !this.db.closed
  }

  async openDatabase(
    databaseName: string,
    version: number,
  ): Promise<Nullable<TransactionAdapter>> {
    this.db = new PGlite(this.getDataDir(databaseName))
    await this.db.waitReady
    return await this.openTransaction()
  }

  async closeDatabase(): Promise<void> {
    check(isNotNull(this.db), 'Database is not open.')
    await (this.db as PGliteInterface).close()
  }

  async deleteDatabase(databaseName: string): Promise<void> {
    todo()
  }

  async openTransaction(): Promise<TransactionAdapter> {
    return new Promise((resolveAdapter) => {
      check(isNotNull(this.db), 'No database is open.')
      ;(this.db as PGliteInterface).transaction((tx) => {
        return new Promise((resolveTransaction) => {
          const adapter = new PGLiteDatabaseTransactionAdapter(
            this.knex,
            tx,
            () => resolveTransaction(null),
          )

          resolveAdapter(adapter)
        })
      })
    })
  }

  getDatabaseInfo(databaseName: string): Promise<Nullable<DatabaseInfo>> {
    todo()
  }

  getDatabases(): Promise<Array<DatabaseInfo>> {
    todo()
  }

  getTableIndexNames(tableName: string): Promise<Array<string>> {
    todo()
  }

  async getTableNames(): Promise<Array<string>> {
    check(isNotNull(this.db), 'No database is open.')

    const builder = this.knex
      .select('tablename')
      .from('pg_catalog.pg_tables')
      .whereNot('schemaname', 'pg_catalog')
      .whereNot('schemaname', 'information_schema')

    const res = await this.db.query(builder.toQuery())

    return getOrDefault(res.rows, []).map((row: any) => row.tablename)
  }
}
