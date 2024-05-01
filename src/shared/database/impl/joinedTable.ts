import type {
  FindArgs,
  FindManyArgs,
  JoinedTable,
  LeftJoinArgs,
} from '@shared/database/database'
import type { DatabaseTableAdapter } from '@shared/database/adapter'
import { firstOf } from '@shared/lib/utils/list'
import { check, isDefined } from '@shared/lib/utils/checks'
import { DatabaseQueryableImpl } from '@shared/database/impl/queryable'
import { entriesOf } from '@shared/lib/utils/object'
import { DatabaseTableBaseImpl } from '@shared/database/impl/tableBase'

export class DatabaseJoinedTableImpl<
    TLeftData extends object,
    TRightData extends object,
  >
  extends DatabaseTableBaseImpl<TLeftData>
  implements JoinedTable<TLeftData, TRightData>
{
  constructor(
    protected readonly leftTableAdapter: DatabaseTableAdapter<TLeftData>,
    protected readonly rightTableAdapter: DatabaseTableAdapter<TRightData>,
    protected readonly rightArgs: LeftJoinArgs<TLeftData, TRightData>,
  ) {
    super(leftTableAdapter)
  }

  override async openIterator(
    args?: FindManyArgs<TLeftData>,
    predicate?: (value: TLeftData) => boolean,
  ) {
    const rightQueryable = new DatabaseQueryableImpl(this.rightTableAdapter)

    const rightRows = await rightQueryable.findMany({
      where: this.rightArgs.where,
    })

    const [leftJoinKey, rightJoinKey] = firstOf(entriesOf(this.rightArgs.on))
    check(isDefined(rightJoinKey), 'Right key is not defined.')

    const rightJoinValues = rightRows.map(
      (rightData) => rightData[rightJoinKey as keyof TRightData],
    )

    const rightPredicate = (value: any) => {
      return rightJoinValues.includes(value[leftJoinKey])
    }

    return await super.openIterator(args, rightPredicate)
  }

  override async deleteAll(): Promise<void> {
    const iterator = await this.openIterator()

    for await (const cursor of iterator) {
      cursor.delete()
    }
  }
}
