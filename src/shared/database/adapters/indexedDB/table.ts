import type { TableAdapter } from '@shared/database/types/adapter'
import { IdbQueryableTableAdapter } from '@shared/database/adapters/indexedDB/queryableTable'

export class IdbTableAdapter<TRow extends object>
  extends IdbQueryableTableAdapter<TRow>
  implements TableAdapter<TRow> {}
