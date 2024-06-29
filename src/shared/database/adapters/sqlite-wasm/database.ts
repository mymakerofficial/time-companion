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
import { sqlite3WorkerPromiser } from '@database/adapters/sqlite-wasm/wrapper'

export class SqliteWasmDatabaseAdapter implements DatabaseAdapter {
  constructor() {}

  get isOpen(): boolean {
    return false
  }

  async init() {
    console.log('Loading and initializing SQLite3 module...')

    const promiser = await sqlite3WorkerPromiser()

    console.log('Done initializing. Running demo...')

    let response

    response = await promiser('config-get', {})
    console.log('Running SQLite3 version', response.result.version.libVersion)

    response = await promiser('open', {
      filename: 'file:worker-promiser.sqlite3?vfs=opfs',
    })
    const { dbId } = response
    console.log(
      'OPFS is available, created persisted database at',
      response.result.filename.replace(/^file:(.*?)\?vfs=opfs/, '$1'),
    )

    await promiser('exec', { dbId, sql: 'CREATE TABLE IF NOT EXISTS t(a,b)' })
    console.log('Creating a table...')

    console.log('Insert some data using exec()...')
    for (let i = 20; i <= 25; ++i) {
      await promiser('exec', {
        dbId,
        sql: 'INSERT INTO t(a,b) VALUES (?,?)',
        bind: [i, i * 2],
      })
    }

    console.log('Query data with exec()')
    await promiser('exec', {
      dbId,
      sql: 'SELECT a FROM t ORDER BY a',
      callback: (result) => {
        if (!result.row) {
          return
        }
        console.log(result.row)
      },
    })

    await promiser('exec', {
      dbId,
      sql: 'DROP TABLE t',
    })

    await promiser('close', { dbId })
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
