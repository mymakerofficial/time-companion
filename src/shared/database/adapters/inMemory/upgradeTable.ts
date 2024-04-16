import type { CreateIndexArgs } from '@shared/database/database'

export class InMemoryDatabaseUpgradeTable<TData extends object> {
  constructor() {}

  async createIndex(args: CreateIndexArgs<TData>): Promise<void> {
    return Promise.resolve()
  }
}
