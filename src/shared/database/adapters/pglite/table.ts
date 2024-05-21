import type { TableAdapter } from '@shared/database/types/adapter'
import { PGLiteQueryableTableAdapter } from '@shared/database/adapters/pglite/queryableTable'

export class PGLiteTableAdapter<TData extends object>
  extends PGLiteQueryableTableAdapter<TData>
  implements TableAdapter<TData> {}
