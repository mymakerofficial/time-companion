import type { TableAdapterFactory } from '@shared/database/types/adapter'
import { PGLiteTableAdapter } from '@shared/database/adapters/pglite/table'
import type { Knex } from 'knex'
import type { PGliteInterface, Transaction } from '@electric-sql/pglite'

export class PGLiteTableAdapterFactory implements TableAdapterFactory {
  constructor(
    protected readonly knex: Knex,
    protected readonly db: Transaction | PGliteInterface,
  ) {}

  getTable<TData extends object>(tableName: string) {
    return new PGLiteTableAdapter<TData>(this.knex, this.db, tableName)
  }
}
