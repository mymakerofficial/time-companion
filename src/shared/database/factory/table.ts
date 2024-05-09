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
import type {
  DatabaseTableSchema,
  InferTableType,
} from '@shared/database/types/schema'
import { isString } from '@shared/lib/utils/checks'

export class DatabaseTableImpl<TLeftData extends object>
  extends DatabaseTableBaseImpl<TLeftData>
  implements Table<TLeftData>
{
  constructor(
    protected readonly transactionAdapter: DatabaseTransactionAdapter,
    protected readonly leftTableAdapter: DatabaseTableAdapter<TLeftData>,
  ) {
    super(leftTableAdapter)
  }

  leftJoin<
    TRightData extends object = object,
    TRightSchema extends
      DatabaseTableSchema<TRightData> = DatabaseTableSchema<TRightData>,
  >(
    rightTable: TRightSchema | string,
    args: LeftJoinArgs<TLeftData, InferTableType<TRightSchema>>,
  ): JoinedTable<TLeftData, InferTableType<TRightSchema>> {
    const rightTableName = isString(rightTable)
      ? rightTable
      : rightTable.getRaw().tableName

    const rightTableAdapter =
      this.transactionAdapter.getTable<InferTableType<TRightSchema>>(
        rightTableName,
      )

    return new DatabaseJoinedTableImpl(
      this.leftTableAdapter,
      rightTableAdapter,
      args,
    )
  }
}
