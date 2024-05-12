import type {
  JoinedTableAdapter,
  TableAdapter,
} from '@shared/database/types/adapter'
import { PGLiteTableBaseAdapter } from '@shared/database/adapters/pglite/tableBase'
import { todo } from '@shared/lib/utils/todo'

export class PGLiteTableAdapter<TData extends object>
  extends PGLiteTableBaseAdapter<TData>
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
