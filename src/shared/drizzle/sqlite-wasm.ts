import type { Nullable } from '@shared/lib/utils/types'
import sqlite3InitModule, {
  type Database as SqliteDatabase,
  type Sqlite3Static,
} from '@sqlite.org/sqlite-wasm'
import { check, isNotNull, isNull } from '@shared/lib/utils/checks'
import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core/db'
import type { SqliteRemoteResult } from 'drizzle-orm/sqlite-proxy/driver'
import type { DrizzleConfig } from 'drizzle-orm/utils'
import { drizzle as drizzleBase } from 'drizzle-orm/sqlite-proxy'

export class Sqlite3Connector {
  protected sqlite3: Nullable<Sqlite3Static> = null
  protected db: Nullable<SqliteDatabase> = null

  async init() {
    check(isNull(this.sqlite3), 'SQLite3 already initialized')
    check(isNull(this.db), 'Database already created')
    this.sqlite3 = await sqlite3InitModule({
      print: console.log,
      printErr: console.error,
    })
    console.debug('Running SQLite3 version', this.sqlite3.version.libVersion)
    this.db = new this.sqlite3.oo1.JsStorageDb('local')
    console.debug('Created database using kvvfs')
  }

  async exec(
    sql: string,
    bind: Array<any>,
    _method: 'run' | 'all' | 'values' | 'get',
  ): Promise<{ rows: Array<any> }> {
    return new Promise((resolve) => {
      console.log('Executing SQL:', sql, bind)
      check(isNotNull(this.db), 'Database not initialized')
      const rows = this.db.exec({
        sql,
        bind,
        returnValue: 'resultRows',
      })

      resolve({ rows })
    })
  }
}

export interface SqliteWasmDatabase<
  TSchema extends Record<string, unknown> = Record<string, never>,
> extends BaseSQLiteDatabase<'async', SqliteRemoteResult, TSchema> {
  init(): Promise<void>
  execRaw(sql: string, bind?: Array<any>): Promise<{ rows: Array<any> }>
}

export function drizzle<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(
  connector: Sqlite3Connector,
  config?: DrizzleConfig<TSchema>,
): SqliteWasmDatabase<TSchema> {
  const obj = drizzleBase(
    (sql: string, bind: Array<any>, method: 'run' | 'all' | 'values' | 'get') =>
      connector.exec(sql, bind, method),
    config,
  )
  return Object.assign(obj, {
    init: () => connector.init(),
    execRaw: (sql: string, bind: Array<any> = []) =>
      connector.exec(sql, bind, 'all'),
  })
}
