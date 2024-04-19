import type { Join, LeftJoin, LeftJoinArgs } from '@shared/database/database'
import { InMemoryDatabaseQueryable } from '@shared/database/adapters/inMemory/queryable'
import { wherePredicate } from '@shared/database/helpers/wherePredicate'
import { firstOf } from '@shared/lib/utils/list'
import { entriesOf } from '@shared/lib/utils/object'
import { check, isDefined } from '@shared/lib/utils/checks'
import { type InMemoryDataTable } from '@shared/database/adapters/inMemory/helpers/dataTable'

export class InMemoryDatabaseLeftJoin<TData extends object>
  extends InMemoryDatabaseQueryable<TData>
  implements LeftJoin<TData> {}

export class InMemoryDatabaseJoin<
  TLeftData extends object,
  TRightData extends object,
> implements Join<TLeftData, TRightData>
{
  constructor(
    private readonly leftTable: InMemoryDataTable<TLeftData>,
    private readonly rightTable: InMemoryDataTable<TRightData>,
  ) {}

  left(args: LeftJoinArgs<TLeftData, TRightData>): LeftJoin<TLeftData> {
    const { on, where } = args

    const filteredRightTableRows = this.rightTable.rows.filter(
      wherePredicate(where),
    )

    const [leftKey, rightKey] = firstOf(entriesOf(on))

    check(isDefined(rightKey), 'Right key is not defined.')

    const filteredLeftTableRows = this.leftTable.rows.filter((leftData) =>
      filteredRightTableRows.some(
        // @ts-expect-error
        (rightData) => rightData[rightKey] === leftData[leftKey],
      ),
    )

    const filteredLeftTable = this.leftTable.copyWithRows(filteredLeftTableRows)

    return new InMemoryDatabaseLeftJoin<TLeftData>(
      filteredLeftTable,
    ) as LeftJoin<TLeftData>
  }
}
