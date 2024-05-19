import type { TableAdapterFactory } from '@shared/database/types/adapter'
import { PGLiteTableAdapter } from '@shared/database/adapters/pglite/table'
import type { Knex } from 'knex'
import type { PGliteInterface, Transaction } from '@electric-sql/pglite'
import type { Nullable } from '@shared/lib/utils/types'
import { check, isNotNull } from '@shared/lib/utils/checks'

export class PGLiteTableAdapterFactory implements TableAdapterFactory {
  constructor(
    protected readonly knex: Knex,
    protected db: Nullable<Transaction | PGliteInterface>,
  ) {}

  getTable<TData extends object>(tableName: string) {
    check(isNotNull(this.db), 'Database is not open.')
    return new PGLiteTableAdapter<TData>(this.knex, this.db, tableName)
  }
}
