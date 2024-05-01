import type {
  JoinedTable,
  LeftJoinArgs,
  Table,
} from '@shared/database/database'
import { DatabaseJoinedTableImpl } from '@shared/database/impl/joinedTable'
import type {
  DatabaseTableAdapter,
  DatabaseTransactionAdapter,
} from '@shared/database/adapter'
import { DatabaseTableBaseImpl } from '@shared/database/impl/tableBase'

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
