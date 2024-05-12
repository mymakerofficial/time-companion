import { IdbTableBaseAdapter } from '@shared/database/adapters/indexedDB/tableBase'
import type {
  JoinedTableAdapter,
  TableAdapter,
} from '@shared/database/types/adapter'
import { todo } from '@shared/lib/utils/todo'

export class IdbTableAdapter<TData extends object>
  extends IdbTableBaseAdapter<TData>
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
