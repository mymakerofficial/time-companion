import type { TableAdapter } from '@shared/database/types/adapter'
import { IdbQueryableTableAdapter } from '@shared/database/adapters/indexedDB/queryableTable'

export class IdbTableAdapter<TData extends object>
  extends IdbQueryableTableAdapter<TData>
  implements TableAdapter<TData> {}
