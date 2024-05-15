import type {
  JoinedTableAdapter,
  TableAdapter,
} from '@shared/database/types/adapter'
import { PGLiteQueryableTableAdapter } from '@shared/database/adapters/pglite/queryableTable'
import { PGLiteJoinedTableAdapter } from '@shared/database/adapters/pglite/joinedTable'

export class PGLiteTableAdapter<TData extends object>
  extends PGLiteQueryableTableAdapter<TData>
  implements TableAdapter<TData>
{
  leftJoin<TRightData extends object>(
    rightTableName: string,
    leftTableColumn: string,
    rightTableColumn: string,
  ): JoinedTableAdapter<TData, TRightData> {
    return new PGLiteJoinedTableAdapter(
      this.knex,
      this.db,
      this.tableName,
      rightTableName,
      leftTableColumn,
      rightTableColumn,
    )
  }
}
