import type { CreateIndexArgs } from '@shared/database/database'
import type { InMemoryDataTable } from '@shared/database/adapters/inMemory/dataTable'

export class InMemoryDatabaseUpgradeTable<TData extends object> {
  constructor(protected readonly table: InMemoryDataTable<TData>) {}

  async createIndex(args: CreateIndexArgs<TData>): Promise<void> {
    return new Promise((resolve) => {
      this.table.createIndex(args)
      resolve()
    })
  }
}
