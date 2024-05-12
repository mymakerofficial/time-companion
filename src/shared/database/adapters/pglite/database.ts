import type {
  DatabaseAdapter,
  DatabaseInfo,
  DatabaseTransactionAdapter,
} from '@shared/database/types/adapter'
import type { Knex } from 'knex'
import createKnex from 'knex'
import { PGlite, type PGliteInterface } from '@electric-sql/pglite'
import type { Nullable } from '@shared/lib/utils/types'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { PGLiteDatabaseTransactionAdapter } from '@shared/database/adapters/pglite/transaction'
import path from 'path'
import { todo } from '@shared/lib/utils/todo'

export function pgliteAdapter(): DatabaseAdapter {
  return new PGLiteDatabaseAdapter()
}

export class PGLiteDatabaseAdapter implements DatabaseAdapter {
  protected readonly knex: Knex
  protected db: Nullable<PGliteInterface>

  constructor(
    protected readonly protocol: string = 'memory',
    protected readonly basePath: string = '',
  ) {
    this.knex = createKnex({
      client: 'pg',
    })

    this.db = null
  }

  protected getDataDir(databaseName: string): string {
    return `${this.protocol}://${path.join(this.basePath, databaseName)}`
  }

  async openDatabase(
    databaseName: string,
    version: number,
  ): Promise<Nullable<DatabaseTransactionAdapter>> {
    this.db = new PGlite(this.getDataDir(databaseName))
    await this.db.waitReady
    return await this.openTransaction()
  }

  async closeDatabase(): Promise<void> {
    check(isNotNull(this.db), 'No database is open.')
    await this.db.close()
  }

  async deleteDatabase(databaseName: string): Promise<void> {
    todo()
  }

  async openTransaction(): Promise<DatabaseTransactionAdapter> {
    return new Promise((resolveAdapter) => {
      check(isNotNull(this.db), 'No database is open.')

      this.db.transaction((tx) => {
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

  getTableNames(): Promise<Array<string>> {
    todo()
  }
}
