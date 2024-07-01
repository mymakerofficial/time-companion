import type { Nullable } from '@shared/lib/utils/types'
import sqlite3InitModule, {
  type Database as SqliteDatabase,
  type Sqlite3Static,
} from '@sqlite.org/sqlite-wasm'
import { check, isNotNull, isNull } from '@shared/lib/utils/checks'
import type { DatabaseConnector } from '@shared/drizzle/connector/connector'

export class SqliteWasmConnector implements DatabaseConnector {
  protected sqlite3: Nullable<Sqlite3Static> = null
  public database: Nullable<SqliteDatabase> = null

  async init() {
    check(isNull(this.sqlite3), 'SQLite3 already initialized')
    check(isNull(this.database), 'Database already created')
    this.sqlite3 = await sqlite3InitModule({
      print: console.log,
      printErr: console.error,
    })
    console.debug('Running SQLite3 version', this.sqlite3.version.libVersion)
    this.database = new this.sqlite3.oo1.JsStorageDb('local')
    console.debug('Created database using kvvfs')
  }

  async exec(
    sql: string,
    bind: Array<any> = [],
  ): Promise<{ rows: Array<any> }> {
    return new Promise((resolve) => {
      check(isNotNull(this.database), 'Database not initialized')
      const rows = this.database.exec({
        sql,
        bind,
        returnValue: 'resultRows',
      })

      resolve({ rows })
    })
  }
}
