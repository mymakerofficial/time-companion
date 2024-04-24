import { InMemoryDatabase } from '@shared/database/adapters/inMemory/database'
import type {
  CreateTableArgs,
  Database,
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

type TableMeta = CreateTableArgs<any> & {
  indexes: string[]
}

type DatabaseMeta = {
  name: string
  version: number
  tables: Array<TableMeta>
}

export class FileSystemDatabase extends InMemoryDatabase implements Database {
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

  private async dbExists(dbName: string) {
    return !!(await fs.stat(this.getDBPath(dbName)).catch(() => null))
  }

  private async ensureDBExists(dbName: string) {
    await fs.mkdir(this.getDBPath(dbName), {
      recursive: true,
    })
  }

  private formatTableRows(rows: InMemoryDataTable<any>['rows']) {
    return JSON.stringify(rows)
  }

  private parseTableRows(content: string): InMemoryDataTable<any>['rows'] {
    return JSON.parse(content)
  }

  private formatDatabaseMeta(meta: DatabaseMeta) {
    return JSON.stringify(meta)
  }

  private parseDatabaseMeta(content: string): DatabaseMeta {
    return JSON.parse(content)
  }

  private createTableMeta(table: InMemoryDataTable<any>): TableMeta {
    return {
      name: table.name,
      primaryKey: table.primaryKey,
      schema: table.schema,
      indexes: toArray(table.getIndexes()),
    }
  }

  private createDataTable(
    tableMeta: TableMeta,
    rows: InMemoryDataTable<any>['rows'],
  ) {
    const dataTable = new InMemoryDataTableImpl(
      tableMeta.name,
      tableMeta.schema,
      // @ts-expect-error
      tableMeta.primaryKey,
    )

    tableMeta.indexes.forEach((keyPath: string) =>
      dataTable.createIndex({ keyPath }),
    )

    dataTable.rows.push(...rows)

    return dataTable
  }

  private createDatabaseMeta(): DatabaseMeta {
    check(isNotNull(this.name), 'Database is not open.')
    check(isNotNull(this.version), 'No Database version is set.')

    return {
      name: this.name,
      version: this.version,
      tables: toArray(this.tables).map(([_, table]) =>
        this.createTableMeta(table),
      ),
    }
  }

  protected async initialize(dbName: string) {
    if (!(await this.dbExists(dbName))) {
      return
    }

    const metaContent = await fs.readFile(this.getMetaPath(dbName), {
      encoding: 'utf-8',
    })
    const meta = this.parseDatabaseMeta(metaContent)

    this.name = meta.name
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
    check(isNotNull(this.name), 'Database is not open.')

    if (!(await this.dbExists(this.name))) {
      return
    }

    const tableNames = await this.getTableNames()

    for (const tableName of tableNames) {
      const table = this.tables.get(tableName)

      check(isDefined(table), 'How did we get here?')

      const tableRowsContent = await fs.readFile(
        this.getTablePath(this.name, tableName),
        'utf-8',
      )

      table.rows = this.parseTableRows(tableRowsContent)
    }
  }

  protected async commitDatabaseMeta() {
    check(isNotNull(this.name), 'Database is not open.')

    await this.ensureDBExists(this.name)

    const meta = this.createDatabaseMeta()

    await fs.writeFile(
      this.getMetaPath(this.name),
      this.formatDatabaseMeta(meta),
    )
  }

  protected async commitTableRows() {
    check(isNotNull(this.name), 'Database is not open.')

    await this.ensureDBExists(this.name)

    const tableNames = await this.getTableNames()

    for (const tableName of tableNames) {
      const table = this.tables.get(tableName)

      check(isDefined(table), 'How did we get here?')

      await fs.writeFile(
        this.getTablePath(this.name, tableName),
        this.formatTableRows(table.rows),
      )
    }
  }

  async open(
    name: string,
    version: number,
    upgrade: UpgradeFunction,
  ): Promise<void> {
    await this.initialize(name)

    await super
      .open(name, version, upgrade)
      .then(async () => {
        await this.commitDatabaseMeta()
        await this.commitTableRows()
      })
      .catch(async (error) => {
        await this.close()
        throw error
      })
  }

  async close(): Promise<void> {
    await super.close()
  }

  async delete(dbName: string): Promise<void> {
    await super.delete(dbName)

    // scary o.o
    await fs.rm(this.getDBPath(dbName), {
      recursive: true,
    })
  }

  async withTransaction<TResult>(
    fn: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    return await super
      .withTransaction(fn)
      .then(async (res) => {
        await this.commitTableRows()
        return res
      })
      .catch(async (error) => {
        await this.restoreTableRows()
        throw error
      })
  }
}

export function createFileSystemDBAdapter(basePath: string): Database {
  return new FileSystemDatabase(basePath)
}
