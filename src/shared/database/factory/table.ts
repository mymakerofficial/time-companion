import type {
  JoinedTable,
  LeftJoinProps,
  Table,
} from '@shared/database/types/database'
import type {
  TableAdapter,
  TransactionAdapter,
} from '@shared/database/types/adapter'
import { DatabaseQueryableTableImpl } from '@shared/database/factory/queryableTable'
import type {
  InferTable,
  RawWhere,
  TableSchema,
  WhereBuilder,
  WhereBuilderOrRaw,
} from '@shared/database/types/schema'
import type { Nullable } from '@shared/lib/utils/types'
import { isNotDefined } from '@renderer/lib/utils'
import { check, isDefined, isString } from '@shared/lib/utils/checks'

export class DatabaseTableImpl<TLeftData extends object>
  extends DatabaseQueryableTableImpl<TLeftData>
  implements Table<TLeftData>
{
  constructor(
    protected readonly transactionAdapter: TransactionAdapter,
    protected readonly leftTableAdapter: TableAdapter<TLeftData>,
  ) {
    super(leftTableAdapter)
  }

  protected getWhere(props?: {
    where?: WhereBuilderOrRaw<TLeftData>
  }): Nullable<RawWhere> {
    if (isNotDefined(props) || isNotDefined(props.where)) {
      return null
    }

    if (isDefined((props.where as WhereBuilder<TLeftData>)._)) {
      return (props.where as WhereBuilder<TLeftData>)._.raw
    }

    return props.where as RawWhere
  }

  leftJoin<
    TRightData extends object = object,
    TRightSchema extends TableSchema<TRightData> = TableSchema<TRightData>,
  >(
    rightTable: TRightSchema | string,
    props: LeftJoinProps<TLeftData, InferTable<TRightSchema>>,
  ): JoinedTable<TLeftData, InferTable<TRightSchema>> {
    const onWhere = this.getWhere(props.on) // TODO: why the type not work?

    check(onWhere?.type === 'condition', '"on" must be a simple condition')
    check(onWhere.operator === 'equals', '"on" condition use "equals" operator')

    const rightTableName = isString(rightTable)
      ? rightTable
      : rightTable._.raw.tableName

    return new DatabaseQueryableTableImpl(
      this.leftTableAdapter.leftJoin(
        rightTableName,
        onWhere.column.columnName,
        onWhere.value._.raw.columnName,
      ),
    )
  }
}
