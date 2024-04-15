import type { Join, LeftJoin, LeftJoinArgs } from '@shared/database/database'
import { InMemoryDatabaseQueryable } from '@shared/database/inMemory/queryable'
import { wherePredicateFn } from '@shared/database/inMemory/wherePredicateFn'
import { firstOf } from '@shared/lib/utils/list'
import { entriesOf } from '@shared/lib/utils/object'
import { check, isDefined } from '@shared/lib/utils/checks'

export class InMemoryDatabaseLeftJoin<TData extends object>
  extends InMemoryDatabaseQueryable<TData>
  implements LeftJoin<TData> {}

export class InMemoryDatabaseJoin<
  TLeftData extends object,
  TRightData extends object,
> implements Join<TLeftData, TRightData>
{
  constructor(
    private readonly leftTableData: Array<TLeftData>,
    private readonly rightTableData: Array<TRightData>,
  ) {}

  left(args: LeftJoinArgs<TLeftData, TRightData>): LeftJoin<TLeftData> {
    const { on, where } = args

    const filteredRightTableData = this.rightTableData.filter((rightData) =>
      wherePredicateFn(rightData, where),
    )

    const [leftKey, rightKey] = firstOf(entriesOf(on))

    check(isDefined(rightKey), 'Right key is not defined.')

    const filteredLeftTableData = this.leftTableData.filter((leftData) =>
      filteredRightTableData.some(
        // @ts-expect-error
        (rightData) => rightData[rightKey] === leftData[leftKey],
      ),
    )

    return new InMemoryDatabaseLeftJoin<TLeftData>(
      filteredLeftTableData,
    ) as LeftJoin<TLeftData>
  }
}
