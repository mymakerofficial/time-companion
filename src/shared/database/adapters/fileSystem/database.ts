import { InMemoryDatabase } from '@shared/database/adapters/inMemory/database'
import type {
  Database,
  Transaction,
  UpgradeFunction,
} from '@shared/database/database'
import fs from 'node:fs/promises'
import path from 'path'
import { check, isDefined, isNotNull } from '@shared/lib/utils/checks'
import { toArray } from '@shared/lib/utils/list'
import { InMemoryDataTableImpl } from '@shared/database/adapters/inMemory/helpers/dataTable'

export class FileSystemDatabase extends InMemoryDatabase implements Database {
  constructor() {
    super()
  }

  protected async read(name: string) {
    const metaPath = path.join(process.cwd(), '.data', 'db', name, 'meta.json')

    const metaExists = !!(await fs.stat(metaPath).catch(() => null))

    if (!metaExists) {
      return Promise.resolve()
    }

    const meta = JSON.parse(await fs.readFile(metaPath, 'utf-8'))

    this.name = meta.name
    this.version = meta.version

    for (const table of meta.tables) {
      const dataTable = new InMemoryDataTableImpl(
        table.name,
        table.schema,
        // @ts-ignore
        table.primaryKey,
      )

      table.indexes.forEach((keyPath: string) =>
        // @ts-ignore
        dataTable.createIndex({ keyPath }),
      )

      this.tables.set(
        table.name,
        // @ts-ignore
        dataTable,
      )

      const tablePath = path.join(
        process.cwd(),
        '.data',
        'db',
        name,
        `${table.name}.json`,
      )

      const data = JSON.parse(await fs.readFile(tablePath, 'utf-8'))

      this.tables.get(table.name)?.rows.push(...data)
    }
  }

  protected async commitMeta() {
    check(isNotNull(this.name), 'Database is not open.')

    await fs.mkdir(path.join(process.cwd(), '.data', 'db', this.name), {
      recursive: true,
    })

    const meta = {
      name: this.name,
      version: this.version,
      tables: toArray(this.tables).map(([_, table]) => ({
        name: table.name,
        primaryKey: table.primaryKey,
        schema: table.schema,
        indexes: toArray(table.getIndexes()),
      })),
    }

    await fs.writeFile(
      path.join(process.cwd(), '.data', 'db', this.name, 'meta.json'),
      JSON.stringify(meta),
    )
  }

  protected async commitTables() {
    check(isNotNull(this.name), 'Database is not open.')

    await fs.mkdir(path.join(process.cwd(), '.data', 'db', this.name), {
      recursive: true,
    })

    const tableNames = await this.getTableNames()

    for (const tableName of tableNames) {
      const table = this.tables.get(tableName)

      check(isDefined(table), 'How did we get here?')

      const data = JSON.stringify(table.rows)

      await fs.writeFile(
        path.join(process.cwd(), '.data', 'db', this.name, `${tableName}.json`),
        data,
      )
    }
  }

  async open(
    name: string,
    version: number,
    upgrade: UpgradeFunction,
  ): Promise<void> {
    await this.read(name)
    await super.open(name, version, upgrade)
    await this.commitMeta()
    await this.commitTables()
  }

  async close(): Promise<void> {
    await super.close()
  }

  async delete(name: string): Promise<void> {
    await super.delete(name)
    await fs.rm(path.join(process.cwd(), '.data', 'db', name), {
      recursive: true,
    })
  }

  async withTransaction<TResult>(
    fn: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    const res = await super.withTransaction(fn)
    await this.commitTables()
    return res
  }
}

export function createFileSystemDBAdapter(): Database {
  return new FileSystemDatabase()
}
