import type { Join, Table, Transaction } from '@shared/database/database'
import { check, isNotEmpty } from '@shared/lib/utils/checks'
import { IDBAdapterTable } from '@shared/database/adapters/indexedDB/table'
import { toArray } from '@shared/lib/utils/list'
import { IDBAdapterJoin } from '@shared/database/adapters/indexedDB/join'

export class IDBAdapterTransaction implements Transaction {
  private readonly transaction: IDBTransaction

  constructor(protected readonly database: IDBDatabase) {
    const objectStoreNames = Array.from(this.database.objectStoreNames)

    check(isNotEmpty(objectStoreNames), 'Database has no tables.')

    this.transaction = this.database.transaction(
      Array.from(this.database.objectStoreNames),
      'readwrite',
    )
  }

  table<TData extends object>(tableName: string): Table<TData> {
    const objectStoreNames = toArray(this.database.objectStoreNames)

    check(
      objectStoreNames.includes(tableName),
      `Table "${tableName}" does not exist.`,
    )

    const objectStore = this.transaction.objectStore(tableName)

    return new IDBAdapterTable<TData>(objectStore)
  }

  join<TLeftData extends object, TRightData extends object>(
    leftTableName: string,
    rightTableName: string,
  ): Join<TLeftData, TRightData> {
    const objectStoreNames = toArray(this.database.objectStoreNames)

    check(
      objectStoreNames.includes(leftTableName),
      `Table "${leftTableName}" does not exist.`,
    )
    check(
      objectStoreNames.includes(rightTableName),
      `Table "${rightTableName}" does not exist.`,
    )

    const leftStore = this.transaction.objectStore(leftTableName)
    const rightStore = this.transaction.objectStore(rightTableName)

    return new IDBAdapterJoin<TLeftData, TRightData>(
      leftStore,
      rightStore,
    ) as Join<TLeftData, TRightData>
  }
}
