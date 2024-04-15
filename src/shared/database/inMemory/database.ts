import type {
  CreateTableArgs,
  Database,
  Transaction,
} from '@shared/database/database'
import { InMemoryDatabaseTransaction } from '@shared/database/inMemory/transaction'

class InMemoryDatabase implements Database {
  data: Map<string, Array<object>>

  constructor() {
    this.data = new Map()
  }

  async createTransaction<T>(
    fn: (transaction: Transaction) => Promise<T>,
  ): Promise<T> {
    return await fn(new InMemoryDatabaseTransaction(this.data))
  }

  async createTable(args: CreateTableArgs): Promise<void> {
    this.data.set(args.name, [])
  }
}

export function createInMemoryDatabase(): Database {
  return new InMemoryDatabase()
}
