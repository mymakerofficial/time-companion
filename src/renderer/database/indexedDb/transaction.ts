import type { Join, Table, Transaction } from '@shared/database/database'
import { check, isNotEmpty } from '@shared/lib/utils/checks'
import { IndexedDbFacadeTable } from '@renderer/database/indexedDb/table'
import { todo } from '@shared/lib/utils/todo'
import { IndexedDbFacadeBase } from '@renderer/database/indexedDb/base'

export class IndexedDbFacadeTransaction
  extends IndexedDbFacadeBase
  implements Transaction
{
  private readonly transaction: IDBTransaction

  constructor(database: IDBDatabase) {
    super(database)

    const objectStoreNames = Array.from(this.database.objectStoreNames)

    check(isNotEmpty(objectStoreNames), 'Database has no tables.')

    this.transaction = this.database.transaction(
      Array.from(this.database.objectStoreNames),
      'readwrite',
    )
  }

  table<TData extends object>(tableName: string): Table<TData> {
    const objectStore = this.transaction.objectStore(tableName)

    return new IndexedDbFacadeTable<TData>(objectStore)
  }

  join<TLeftData extends object, TRightData extends object>(
    leftTable: string,
    rightTable: string,
  ): Join<TLeftData, TRightData> {
    todo()
  }
}
