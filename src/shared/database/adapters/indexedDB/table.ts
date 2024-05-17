import type {
  JoinedTableAdapter,
  TableAdapter,
} from '@shared/database/types/adapter'
import { todo } from '@shared/lib/utils/todo'
import { IdbQueryableTableAdapter } from '@shared/database/adapters/indexedDB/queryableTable'

export class IdbTableAdapter<TData extends object>
  extends IdbQueryableTableAdapter<TData>
  implements TableAdapter<TData>
{
  leftJoin<TRightData extends object>(
    rightTableName: string,
    leftTableColumn: string,
    rightTableColumn: string,
  ): JoinedTableAdapter<TData, TRightData> {
    todo()
  }
}
