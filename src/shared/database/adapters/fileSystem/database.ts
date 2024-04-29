import { InMemoryDatabaseAdapterImpl } from '@shared/database/adapters/inMemory/database'
import type {
  CreateTableArgs,
  Transaction,
  UpgradeFunction,
} from '@shared/database/database'
import fs from 'node:fs/promises'
import path from 'path'
import { check, isDefined, isNotNull } from '@shared/lib/utils/checks'
import { toArray } from '@shared/lib/utils/list'
import {
  type InMemoryDataTable,
  InMemoryDataTableImpl,
} from '@shared/database/adapters/inMemory/helpers/dataTable'
import { asyncGetOrDefault } from '@shared/lib/utils/result'
import type {
  DatabaseAdapter,
  DatabaseTransactionAdapter,
  DatabaseTransactionMode,
} from '@shared/database/adapter'
import { asArray } from '@renderer/lib/listUtils'
import type { Nullable } from '@shared/lib/utils/types'

type IndexMeta = {
  keyPath: string
  unique: boolean
}

type TableMeta = {
  name: string
  primaryKey: string
  indexes: Array<IndexMeta>
}

type DatabaseMeta = {
  name: string
  version: number
  tables: Array<TableMeta>
}

export function fileSystemDBAdapter(basePath: string): DatabaseAdapter {
  return new FileSystemDatabaseAdapterImpl(basePath)
}

export class FileSystemDatabaseAdapterImpl
  extends InMemoryDatabaseAdapterImpl
  implements DatabaseAdapter
{
  constructor(protected readonly basePath: string) {
    super()
  }

  private getDBPath(dbName: string) {
    return path.join(this.basePath, 'databases', dbName)
  }

  private getMetaPath(dbName: string) {
    return path.join(this.getDBPath(dbName), 'meta.json')
  }

  private getTablePath(dbName: string, tableName: string) {
    return path.join(this.getDBPath(dbName), `${tableName}.json`)
  }

  private async dbPathExists(dbName: string) {
    return !!(await fs.stat(this.getDBPath(dbName)).catch(() => null))
  }

  private async ensureDBExists(dbName: string) {
    await fs.mkdir(this.getDBPath(dbName), {
      recursive: true,
    })
  }

  private formatTableRows(rows: Array<any>) {
    return JSON.stringify(rows)
  }

  private parseTableRows(content: string): Array<any> {
    return JSON.parse(content)
  }

  private formatDatabaseMeta(meta: DatabaseMeta) {
    return JSON.stringify(meta)
  }

  private parseDatabaseMeta(content: string): DatabaseMeta {
    return JSON.parse(content)
  }

  private createTableMeta(
    tableName: string,
    table: InMemoryDataTable<any>,
  ): TableMeta {
    return {
      name: tableName,
      primaryKey: table.getPrimaryKey().toString(),
      indexes: toArray(table.getIndexes()).map(([keyPath, index]) => ({
        keyPath: keyPath.toString(),
        unique: index.unique,
      })),
    }
  }

  private createDataTable(tableMeta: TableMeta, rows: Array<any>) {
    const dataTable = new InMemoryDataTableImpl(tableMeta.primaryKey)

    dataTable.insertAll(rows)

    tableMeta.indexes.forEach(({ keyPath, unique }) =>
      dataTable.createIndex(keyPath, unique),
    )

    return dataTable
  }

  private createDatabaseMeta(): DatabaseMeta {
    check(isNotNull(this.databaseName), 'Database is not open.')
    check(isNotNull(this.version), 'No Database version is set.')

    return {
      name: this.databaseName,
      version: this.version,
      tables: toArray(this.tables).map(([tableName, table]) =>
        this.createTableMeta(tableName, table),
      ),
    }
  }

  protected async initialize(dbName: string) {
    if (!(await this.dbPathExists(dbName))) {
      return
    }

    const metaContent = await fs.readFile(this.getMetaPath(dbName), {
      encoding: 'utf-8',
    })
    const meta = this.parseDatabaseMeta(metaContent)

    this.databaseName = meta.name
    this.version = meta.version

    for (const table of meta.tables) {
      const tableRowsContent = await asyncGetOrDefault(
        fs.readFile(this.getTablePath(dbName, table.name), {
          encoding: 'utf-8',
        }),
        '[]',
      )
      const tableRows = this.parseTableRows(tableRowsContent)

      const dataTable = this.createDataTable(table, tableRows)

      this.tables.set(table.name, dataTable)
    }
  }

  protected async restoreTableRows() {
    check(isNotNull(this.databaseName), 'Database is not open.')

    if (!(await this.dbPathExists(this.databaseName))) {
      return
    }

    const tableNames = await this.getTableNames()

    for (const tableName of tableNames) {
      const table = this.tables.get(tableName)

      check(isDefined(table), 'How did we get here?')

      const tableRowsContent = await fs.readFile(
        this.getTablePath(this.databaseName, tableName),
        'utf-8',
      )

      table.deleteAll()
      table.insertAll(this.parseTableRows(tableRowsContent))
    }
  }

  protected async commitDatabaseMeta() {
    check(isNotNull(this.databaseName), 'Database is not open.')

    await this.ensureDBExists(this.databaseName)

    const meta = this.createDatabaseMeta()

    await fs.writeFile(
      this.getMetaPath(this.databaseName),
      this.formatDatabaseMeta(meta),
    )
  }

  protected async commitTableRows() {
    check(isNotNull(this.databaseName), 'Database is not open.')

    await this.ensureDBExists(this.databaseName)

    const tableNames = await this.getTableNames()

    for (const tableName of tableNames) {
      const table = this.tables.get(tableName)

      check(isDefined(table), 'How did we get here?')

      await fs.writeFile(
        this.getTablePath(this.databaseName, tableName),
        this.formatTableRows(asArray(table.getRows().values())),
      )
    }
  }

  async openDatabase(
    databaseName: string,
    version: number,
  ): Promise<Nullable<DatabaseTransactionAdapter>> {
    return super.openDatabase(databaseName, version)

    // TODO
    // await this.initialize(databaseName)
    //
    // await super
    //   .openDatabase(databaseName, version, upgrade)
    //   .then(async () => {
    //     await this.commitDatabaseMeta()
    //     await this.commitTableRows()
    //   })
    //   .catch(async (error) => {
    //     await this.closeDatabase()
    //     throw error
    //   })
  }

  async closeDatabase(): Promise<void> {
    await super.closeDatabase()
  }

  async deleteDatabase(databaseName: string): Promise<void> {
    await super.deleteDatabase(databaseName)

    // scary o.o
    await fs.rm(this.getDBPath(databaseName), {
      recursive: true,
    })
  }

  async openTransaction<TResult>(
    tableNames: Array<string>,
    mode: DatabaseTransactionMode,
  ): Promise<DatabaseTransactionAdapter> {
    return await super.openTransaction(tableNames, mode)
    // TODO
    // .then(async (res) => {
    //   await this.commitTableRows()
    //   return res
    // })
    // .catch(async (error) => {
    //   await this.restoreTableRows()
    //   throw error
    // })
  }
}
