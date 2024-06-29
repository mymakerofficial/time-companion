import type {
  DatabaseAdapter,
  DatabaseInfo,
  TableAdapter,
  TransactionAdapter,
} from '@database/types/adapter'
import type { Nullable } from '@shared/lib/utils/types'
import type { TableSchemaRaw } from '@database/types/schema'
import { todo } from '@shared/lib/utils/todo'
import '@sqlite.org/sqlite-wasm'
import { SqliteWorkerWrapper } from '@database/adapters/sqlite-wasm/worker/wrapper'

export class SqliteWasmDatabaseAdapter implements DatabaseAdapter {
  constructor() {}

  get isOpen(): boolean {
    return false
  }

  async init() {
    const sqlite3 = new SqliteWorkerWrapper()
    await sqlite3.init()
    await sqlite3.exec(
      `CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT);`,
    )
    await sqlite3.exec(`INSERT INTO test (name) VALUES ('hello');`)
    await sqlite3.exec(`INSERT INTO test (name) VALUES ('world');`)
    await sqlite3.exec(`SELECT * FROM test;`)
  }

  async openDatabase(): Promise<DatabaseInfo> {
    await this.init()

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
