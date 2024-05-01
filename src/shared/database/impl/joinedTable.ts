import type {
  FindArgs,
  FindManyArgs,
  JoinedTable,
  LeftJoinArgs,
} from '@shared/database/database'
import type {
  DatabaseTableAdapter,
  DatabaseTransactionAdapter,
} from '@shared/database/adapter'
import { firstOf } from '@shared/lib/utils/list'
import { check, isDefined } from '@shared/lib/utils/checks'
import { DatabaseQueryableImpl } from '@shared/database/impl/queryable'
import { entriesOf } from '@shared/lib/utils/object'

export class DatabaseJoinedTableImpl<
    TLeftData extends object,
    TRightData extends object,
  >
  extends DatabaseQueryableImpl<TLeftData>
  implements JoinedTable<TLeftData, TRightData>
{
  constructor(
    protected readonly leftTableAdapter: DatabaseTableAdapter<TLeftData>,
    protected readonly rightTableAdapter: DatabaseTableAdapter<TRightData>,
    protected readonly rightArgs: LeftJoinArgs<TLeftData, TRightData>,
  ) {
    super(leftTableAdapter)
  }

  async findFirst(args?: FindArgs<TLeftData>): Promise<TLeftData> {
    return firstOf(
      await this.findMany({
        ...args,
        limit: 1,
        offset: 0,
      }),
    )
  }

  async findMany(args?: FindManyArgs<TLeftData>): Promise<Array<TLeftData>> {
    const rightQueryable = new DatabaseQueryableImpl(this.rightTableAdapter)

    const rightRows = await rightQueryable.findMany({
      where: this.rightArgs.where,
    })

    const [leftJoinKey, rightJoinKey] = firstOf(entriesOf(this.rightArgs.on))
    check(isDefined(rightJoinKey), 'Right key is not defined.')

    const rightJoinValues = rightRows.map(
      (rightData) => rightData[rightJoinKey as keyof TRightData],
    )

    const predicate = (value: any) => {
      return rightJoinValues.includes(value[leftJoinKey])
    }

    const iterator = await this.openIterator(args, predicate)

    const results = []
    for await (const cursor of iterator) {
      results.push(cursor.value())
    }

    return results
  }
}
