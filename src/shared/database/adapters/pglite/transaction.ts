import type { Transaction } from '@electric-sql/pglite'
import type { DatabaseTransactionAdapter } from '@shared/database/types/adapter'
import { noop } from '@shared/lib/utils/noop'
import type { Knex } from 'knex'
import { PGLiteSchemaAdapter } from '@shared/database/adapters/pglite/schema'

export class PGLiteDatabaseTransactionAdapter
  extends PGLiteSchemaAdapter
  implements DatabaseTransactionAdapter
{
  constructor(
    protected readonly knex: Knex,
    protected readonly tx: Transaction,
    protected readonly close: () => void = noop,
  ) {
    super(knex, tx)
  }

  async commit(): Promise<void> {
    return new Promise((resolve) => {
      this.close()
      resolve()
    })
  }

  async rollback(): Promise<void> {
    await this.tx.rollback()
    this.close()
  }
}
