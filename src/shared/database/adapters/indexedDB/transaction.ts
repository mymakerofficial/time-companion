import type {
  TransactionAdapter,
  DatabaseTransactionMode,
} from '@shared/database/types/adapter'
import { IdbSchemaAdapter } from '@shared/database/adapters/indexedDB/schema'

export class IdbDatabaseTransactionAdapter
  extends IdbSchemaAdapter
  implements TransactionAdapter
{
  constructor(
    protected readonly db: IDBDatabase,
    protected readonly tx: IDBTransaction,
    protected readonly mode: DatabaseTransactionMode,
  ) {
    super(db, tx, mode)
  }

  commit(): Promise<void> {
    return new Promise((resolve) => {
      this.tx.commit()
      resolve()
    })
  }

  rollback(): Promise<void> {
    return new Promise((resolve) => {
      this.tx.abort()
      resolve()
    })
  }
}
