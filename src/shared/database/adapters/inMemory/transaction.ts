import type { Join, Table, Transaction } from '@shared/database/database'
import type { Optional } from '@shared/lib/utils/types'
import { check, isDefined } from '@shared/lib/utils/checks'
import { InMemoryDatabaseTable } from '@shared/database/adapters/inMemory/table'
import { InMemoryDatabaseJoin } from '@shared/database/adapters/inMemory/join'
import type {
  InMemoryDataTable,
  InMemoryDataTables,
} from '@shared/database/adapters/inMemory/helpers/dataTable'

export class InMemoryDatabaseTransaction implements Transaction {
  constructor(protected tables: InMemoryDataTables) {}

  table<TData extends object>(tableName: string): Table<TData> {
    const table = this.tables.get(tableName) as Optional<
      InMemoryDataTable<TData>
    >

    check(isDefined(table), `Table "${tableName}" does not exist.`)

    return new InMemoryDatabaseTable<TData>(table) as Table<TData>
  }

  join<TLeftData extends object, TRightData extends object>(
    leftTableName: string,
    rightTableName: string,
  ): Join<TLeftData, TRightData> {
    const leftTable = this.tables.get(leftTableName) as Optional<
      InMemoryDataTable<TLeftData>
    >
    const rightTable = this.tables.get(rightTableName) as Optional<
      InMemoryDataTable<TRightData>
    >

    check(isDefined(leftTable), `Table "${leftTableName}" does not exist.`)
    check(isDefined(rightTable), `Table "${rightTableName}" does not exist.`)

    return new InMemoryDatabaseJoin<TLeftData, TRightData>(
      leftTable,
      rightTable,
    ) as Join<TLeftData, TRightData>
  }
}
