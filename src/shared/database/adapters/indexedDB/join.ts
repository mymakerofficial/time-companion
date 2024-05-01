import { IDBAdapterQueryable } from '@shared/database/adapters/indexedDB/queryable'
import type {
  FindArgs,
  FindManyArgs,
  JoinedTable,
  LeftJoin,
  LeftJoinArgs,
} from '@shared/database/types/database'
import { firstOf } from '@shared/lib/utils/list'
import { entriesOf } from '@shared/lib/utils/object'
import { check, isDefined } from '@shared/lib/utils/checks'

export class IDBAdapterLeftJoin<
  TLeftData extends object,
  TRightData extends object,
> implements LeftJoin<TLeftData>
{
  constructor(
    private readonly leftStore: IDBObjectStore,
    private readonly rightStore: IDBObjectStore,
    private readonly rightArgs: LeftJoinArgs<TLeftData, TRightData>,
  ) {}

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
    const rightQueryable = new IDBAdapterQueryable<TRightData>(this.rightStore)

    const filteredRightTableRows = await rightQueryable.findMany({
      where: this.rightArgs.where,
    })

    const [leftJoinKey, rightJoinKey] = firstOf(entriesOf(this.rightArgs.on))
    check(isDefined(rightJoinKey), 'Right key is not defined.')

    const rightJoinValues = filteredRightTableRows.map(
      (rightData) => rightData[rightJoinKey as keyof TRightData],
    )

    const predicate = (value: any) => {
      return rightJoinValues.includes(value[leftJoinKey])
    }

    const leftQueryable = new IDBAdapterQueryable<TLeftData>(
      this.leftStore,
      predicate,
    )

    return await leftQueryable.findMany(args)
  }
}

export class IDBAdapterJoin<TLeftData extends object, TRightData extends object>
  implements JoinedTable<TLeftData, TRightData>
{
  constructor(
    private readonly leftStore: IDBObjectStore,
    private readonly rightStore: IDBObjectStore,
  ) {}

  left(args: LeftJoinArgs<TLeftData, TRightData>): LeftJoin<TLeftData> {
    return new IDBAdapterLeftJoin<TLeftData, TRightData>(
      this.leftStore,
      this.rightStore,
      args,
    ) as LeftJoin<TLeftData>
  }
}
