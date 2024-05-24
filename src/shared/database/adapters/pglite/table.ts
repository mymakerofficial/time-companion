import type { TableAdapter } from '@shared/database/types/adapter'
import { PGLiteQueryableTableAdapter } from '@shared/database/adapters/pglite/queryableTable'

export class PGLiteTableAdapter<TRow extends object>
  extends PGLiteQueryableTableAdapter<TRow>
  implements TableAdapter<TRow> {}
