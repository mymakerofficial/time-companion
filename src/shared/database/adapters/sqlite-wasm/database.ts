import type {
  DatabaseAdapter,
  DatabaseInfo,
  TableAdapter,
  TransactionAdapter,
} from '@database/types/adapter'
import type { Nullable } from '@shared/lib/utils/types'
import type { TableSchemaRaw } from '@database/types/schema'
import { todo } from '@shared/lib/utils/todo'
import sqlite3InitModule, {
  type Database as SqliteDatabase,
  type Sqlite3Static,
} from '@sqlite.org/sqlite-wasm'
import { check, isNull } from '@shared/lib/utils/checks'

export class SqliteWasmDatabaseAdapter implements DatabaseAdapter {
  protected sqlite3: Nullable<Sqlite3Static> = null
  protected db: Nullable<SqliteDatabase> = null

  constructor() {}

  get isOpen(): boolean {
    return this.db?.isOpen() ?? false
  }

  async init() {
    check(isNull(this.sqlite3), 'SQLite3 already initialized')
    check(isNull(this.db), 'Database already created')
    this.sqlite3 = await sqlite3InitModule({
      print: console.log,
      printErr: console.error,
    })
    console.log('Running SQLite3 version', this.sqlite3.version.libVersion)
    this.db = new this.sqlite3.oo1.JsStorageDb('local')
  }

  async initUpgrade() {
    this.db?.exec(
      `CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)`,
    )
    this.db?.exec(`INSERT INTO test (name) VALUES ('Hello, World!')`)
    this.db?.exec({ sql: `SELECT * FROM test`, callback: console.log })
  }

  async openDatabase(): Promise<DatabaseInfo> {
    await this.init()
    await this.initUpgrade()

    return {
      version: 1,
    }
  }

  closeDatabase(): Promise<void> {
    todo()
  }

  openTransaction(): Promise<TransactionAdapter> {
    todo()
  }

  openMigration(targetVersion: number): Promise<TransactionAdapter> {
    todo()
  }

  dropSchema(): Promise<void> {
    todo()
  }

  getTable<TRow extends object>(
    tableName: string,
    tableSchema?: TableSchemaRaw<TRow>,
  ): TableAdapter<TRow> {
    todo()
  }

  getTableNames(): Promise<Array<string>> {
    todo()
  }

  getDatabaseInfo(): Promise<Nullable<DatabaseInfo>> {
    todo()
  }
}
