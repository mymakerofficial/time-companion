import type { Join, Table, Transaction } from '@shared/database/database'
import { check, isNotEmpty } from '@shared/lib/utils/checks'
import { IDBAdapterTable } from '@shared/database/adapters/indexedDb/table'
import { todo } from '@shared/lib/utils/todo'

export class IDBAdapterTransaction implements Transaction {
  private readonly transaction: IDBTransaction

  constructor(private readonly database: IDBDatabase) {
    const objectStoreNames = Array.from(this.database.objectStoreNames)

    check(isNotEmpty(objectStoreNames), 'Database has no tables.')

    this.transaction = this.database.transaction(
      Array.from(this.database.objectStoreNames),
      'readwrite',
    )
  }

  table<TData extends object>(tableName: string): Table<TData> {
    const objectStoreNames = Array.from(this.database.objectStoreNames)

    check(
      objectStoreNames.includes(tableName),
      `Table "${tableName}" does not exist.`,
    )

    const objectStore = this.transaction.objectStore(tableName)

    return new IDBAdapterTable<TData>(objectStore)
  }

  join<TLeftData extends object, TRightData extends object>(
    leftTable: string,
    rightTable: string,
  ): Join<TLeftData, TRightData> {
    todo()
  }
}
