import type {
  DatabaseTableAdapter,
  DatabaseTransactionAdapter,
  DatabaseTransactionMode,
} from '@shared/database/types/adapter'
import { todo } from '@shared/lib/utils/todo'
import {
  InMemoryDataTableImpl,
  type InMemoryDataTables,
} from '@shared/database/adapters/inMemory/helpers/dataTable'
import { check, isDefined } from '@shared/lib/utils/checks'
import { InMemoryDatabaseTableAdapterImpl } from '@shared/database/adapters/inMemory/table'
import { noop } from '@shared/lib/utils/noop'

export class InMemoryDatabaseTransactionAdapterImpl
  implements DatabaseTransactionAdapter
{
  constructor(
    protected readonly tables: InMemoryDataTables,
    protected readonly tableNames: Array<string>,
    protected readonly mode: DatabaseTransactionMode,
    protected readonly onCommit: () => void = noop,
    protected readonly onRollback: () => void = noop,
  ) {}

  getTable<TData extends object>(
    tableName: string,
  ): DatabaseTableAdapter<TData> {
    check(
      this.mode === 'versionchange' || // allow all tables to be accessed in a version change transaction
        this.tableNames.includes(tableName),
      `Table "${tableName}" is not in the transaction.`,
    )

    const dataTable = this.tables.get(tableName)

    check(isDefined(dataTable), `Table "${tableName}" does not exist.`)

    return new InMemoryDatabaseTableAdapterImpl<TData>(dataTable)
  }

  async createTable(tableName: string, primaryKey: string): Promise<void> {
    return new Promise((resolve) => {
      const table = new InMemoryDataTableImpl(primaryKey)
      this.tables.set(tableName, table)
      resolve()
    })
  }

  async deleteTable(tableName: string): Promise<void> {
    todo()
  }

  async commit(): Promise<void> {
    // TODO
  }

  async rollback(): Promise<void> {
    // TODO
  }
}
