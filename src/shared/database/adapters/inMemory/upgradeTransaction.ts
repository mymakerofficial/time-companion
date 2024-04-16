import type {
  CreateTableArgs,
  UpgradeTransaction,
} from '@shared/database/database'

export class InMemoryDatabaseUpgradeTransaction implements UpgradeTransaction {
  constructor(private data: Map<string, Array<object>>) {}

  async createTable(args: CreateTableArgs): Promise<void> {
    this.data.set(args.name, [])
  }
}
