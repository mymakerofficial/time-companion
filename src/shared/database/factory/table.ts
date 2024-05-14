import type {
  JoinedTable,
  LeftJoinProps,
  Table,
} from '@shared/database/types/database'
import type {
  TransactionAdapter,
  TableAdapter,
} from '@shared/database/types/adapter'
import { DatabaseTableBaseImpl } from '@shared/database/factory/tableBase'
import type { InferTable, TableSchema } from '@shared/database/types/schema'
import { todo } from '@shared/lib/utils/todo'

export class DatabaseTableImpl<TLeftData extends object>
  extends DatabaseTableBaseImpl<TLeftData>
  implements Table<TLeftData>
{
  constructor(
    protected readonly transactionAdapter: TransactionAdapter,
    protected readonly leftTableAdapter: TableAdapter<TLeftData>,
  ) {
    super(leftTableAdapter)
  }

  leftJoin<
    TRightData extends object = object,
    TRightSchema extends TableSchema<TRightData> = TableSchema<TRightData>,
  >(
    rightTable: TRightSchema | string,
    args: LeftJoinProps<TLeftData, InferTable<TRightSchema>>,
  ): JoinedTable<TLeftData, InferTable<TRightSchema>> {
    todo()
  }
}
