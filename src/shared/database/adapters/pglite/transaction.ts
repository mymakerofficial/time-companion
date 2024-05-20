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

  async createTable<TData extends object>(
    schema: TableSchemaRaw<TData>,
  ): Promise<void> {
    check(isNotNull(this.db), 'Database is not open.')

    const builder = buildCreateTable(this.knex, schema)

    await this.db.exec(builder.toQuery())
  }

  async dropTable(tableName: string): Promise<void> {
    check(isNotNull(this.db), 'Database is not open.')

    const builder = this.knex.schema.dropTable(tableName)

    await this.db.exec(builder.toQuery())
  }

  async alterTable(
    tableName: string,
    actions: Array<AlterTableAction>,
  ): Promise<void> {
    check(isNotNull(this.db), 'Database is not open.')

    const builder = buildAlterTable(this.knex, tableName, actions)

    await this.db.exec(builder.toQuery())
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
