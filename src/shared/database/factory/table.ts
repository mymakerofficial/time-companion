import type {
  JoinedTable,
  LeftJoinArgs,
  Table,
} from '@shared/database/types/database'
import { DatabaseJoinedTableImpl } from '@shared/database/factory/joinedTable'
import type {
  DatabaseTableAdapter,
  DatabaseTransactionAdapter,
} from '@shared/database/types/adapter'
import { DatabaseTableBaseImpl } from '@shared/database/factory/tableBase'

export class DatabaseTableImpl<TData extends object>
  extends DatabaseTableBaseImpl<TData>
  implements Table<TData>
{
  constructor(
    protected readonly transactionAdapter: DatabaseTransactionAdapter,
    protected readonly tableAdapter: DatabaseTableAdapter<TData>,
  ) {
    super(tableAdapter)
  }

  leftJoin<TRightData extends object>(
    rightTableName: string,
    args: LeftJoinArgs<TData, TRightData>,
  ): JoinedTable<TData, TRightData> {
    const rightTableAdapter =
      this.transactionAdapter.getTable<TRightData>(rightTableName)

    return new DatabaseJoinedTableImpl(
      this.tableAdapter,
      rightTableAdapter,
      args,
    )
  }
}
