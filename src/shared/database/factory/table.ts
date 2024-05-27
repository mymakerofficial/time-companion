import type { Table } from '@shared/database/types/database'
import { DatabaseQueryableTableImpl } from '@shared/database/factory/queryableTable'

export class DatabaseTableImpl<TRow extends object>
  extends DatabaseQueryableTableImpl<TRow>
  implements Table<TRow> {}
