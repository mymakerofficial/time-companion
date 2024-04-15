import type {
  CreateTableArgs,
  Database,
  Transaction,
  UpgradeTransaction,
} from '@shared/database/database'
import { InMemoryDatabaseTransaction } from '@shared/database/inMemory/transaction'
import { todo } from '@shared/lib/utils/todo'
import { InMemoryDatabaseUpgradeTransaction } from '@shared/database/inMemory/upgradeTransaction'

class InMemoryDatabase implements Database {
  private readonly data: Map<string, Array<object>>

  constructor() {
    this.data = new Map()
  }

  async open(
    _: string,
    upgrade: (transaction: UpgradeTransaction) => Promise<void>,
  ): Promise<void> {
    return await upgrade(new InMemoryDatabaseUpgradeTransaction(this.data))
  }

  async withTransaction<TResult>(
    fn: (transaction: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    return await fn(new InMemoryDatabaseTransaction(this.data))
  }
}

export function createInMemoryDatabase(): Database {
  return new InMemoryDatabase()
}
