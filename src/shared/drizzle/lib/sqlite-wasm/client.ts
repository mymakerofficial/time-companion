import type { Nullable } from '@shared/lib/utils/types'
import sqlite3InitModule, {
  type Database as SqliteDatabase,
  type Sqlite3Static,
} from '@sqlite.org/sqlite-wasm'
import { check, isNull } from '@shared/lib/utils/checks'

export class SQLiteWasmClient {
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
}

export function sqliteWasm() {
  return new SQLiteWasmClient()
}
