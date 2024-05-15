import { PGLiteQueryableTableAdapter } from '@shared/database/adapters/pglite/queryableTable'
import type {
  AdapterBaseQueryProps,
  JoinedTableAdapter,
} from '@shared/database/types/adapter'
import type { Knex } from 'knex'
import type { PGliteInterface, Transaction } from '@electric-sql/pglite'

export class PGLiteJoinedTableAdapter<
    TData extends object,
    TRightData extends object,
  >
  extends PGLiteQueryableTableAdapter<TData>
  implements JoinedTableAdapter<TData, TRightData>
{
  constructor(
    protected readonly knex: Knex,
    protected readonly db: Transaction | PGliteInterface,
    protected readonly leftTableName: string,
    protected readonly rightTableName: string,
    protected readonly leftTableColumn: string,
    protected readonly rightTableColumn: string,
  ) {
    super(knex, db, leftTableName)
  }

  override build(props: Partial<AdapterBaseQueryProps>) {
    const builder = super.build(props)

    return builder.leftJoin(
      this.rightTableName,
      `${this.leftTableName}.${this.leftTableColumn}`,
      '=',
      `${this.rightTableName}.${this.rightTableColumn}`,
    )
  }
}
