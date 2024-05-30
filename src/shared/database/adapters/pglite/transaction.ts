import type { Transaction } from '@electric-sql/pglite'
import type { TransactionAdapter } from '@shared/database/types/adapter'
import { noop } from '@shared/lib/utils/noop'
import type { Knex } from 'knex'
import type {
  AlterTableAction,
  TableSchemaRaw,
} from '@shared/database/types/schema'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { PGLiteTableAdapterFactory } from '@shared/database/adapters/pglite/tableFactory'
import type { MaybePromise } from '@shared/lib/utils/types'
import { ensurePromise } from '@shared/lib/utils/guards'
import {
  buildAlterTable,
  buildCreateTable,
} from '@shared/database/adapters/pglite/helpers/schemaBuilder'
import { DatabaseNotOpenError } from '@shared/database/types/errors'
import { handlePGliteError } from '@shared/database/adapters/pglite/helpers/errors'

export class PGLiteDatabaseTransactionAdapter
  extends PGLiteTableAdapterFactory
  implements TransactionAdapter
{
  constructor(
    protected readonly knex: Knex,
    protected readonly tx: Transaction,
    protected readonly close: () => void = noop,
    protected readonly onCommit: () => MaybePromise<void> = noop,
    protected readonly onRollback: () => MaybePromise<void> = noop,
  ) {
    super(knex, tx)
  }

  protected async exec(builder: Knex.SchemaBuilder) {
    check(isNotNull(this.db), () => new DatabaseNotOpenError())

    try {
      await this.db.exec(builder.toQuery())
    } catch (error) {
      handlePGliteError(error)
    }
  }

  async createTable<TRow extends object>(
    schema: TableSchemaRaw<TRow>,
  ): Promise<void> {
    const builder = buildCreateTable(this.knex, schema)

    await this.exec(builder)
  }

  async dropTable(tableName: string): Promise<void> {
    const builder = this.knex.schema.dropTable(tableName)

    await this.exec(builder)
  }

  async alterTable(
    tableName: string,
    actions: Array<AlterTableAction>,
  ): Promise<void> {
    const builder = buildAlterTable(this.knex, tableName, actions)

    await this.exec(builder)
  }

  async commit(): Promise<void> {
    return new Promise((resolve) => {
      this.close()
      ensurePromise(this.onCommit()).then(resolve)
      resolve()
    })
  }

  async rollback(): Promise<void> {
    await this.tx.rollback()
    this.close()
    await ensurePromise(this.onRollback())
  }
}
