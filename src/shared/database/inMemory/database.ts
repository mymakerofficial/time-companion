import type {
  CreateTableArgs,
  Database,
  Join,
  Table,
} from '@shared/database/database'
import { todo } from '@shared/lib/utils/todo'
import { InMemoryDatabaseTable } from '@shared/database/inMemory/table'
import type { Optional } from '@shared/lib/utils/types'
import { check, isDefined } from '@shared/lib/utils/checks'
import { InMemoryDatabaseJoin } from '@shared/database/inMemory/join'

export class InMemoryDatabase implements Database {
  data: Map<string, Array<object>>

  constructor() {
    this.data = new Map()
  }

  table<TData extends object>(tableName: string): Table<TData> {
    const tableData = this.data.get(tableName) as Optional<Array<TData>>

    check(isDefined(tableData), `Table "${tableName}" does not exist`)

    return new InMemoryDatabaseTable<TData>(tableData) as Table<TData>
  }

  join<TLeftData extends object, TRightData extends object>(
    leftTableName: string,
    rightTableName: string,
  ): Join<TLeftData, TRightData> {
    const leftTableData = this.data.get(leftTableName) as Optional<
      Array<TLeftData>
    >
    const rightTableData = this.data.get(rightTableName) as Optional<
      Array<TRightData>
    >

    check(isDefined(leftTableData), `Table "${leftTableName}" does not exist`)
    check(isDefined(rightTableData), `Table "${rightTableName}" does not exist`)

    return new InMemoryDatabaseJoin<TLeftData, TRightData>(
      leftTableData,
      rightTableData,
    ) as Join<TLeftData, TRightData>
  }

  async createTable(args: CreateTableArgs): Promise<void> {
    this.data.set(args.name, [])
  }
}
