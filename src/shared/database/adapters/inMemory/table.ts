import type {
  DatabaseCursor,
  DatabaseCursorDirection,
  DatabaseTableAdapter,
} from '@shared/database/types/adapter'
import type { Nullable } from '@shared/lib/utils/types'
import type { InMemoryDataTable } from '@shared/database/adapters/inMemory/helpers/dataTable'

export class InMemoryDatabaseTableAdapterImpl<TData extends object>
  implements DatabaseTableAdapter<TData>
{
  constructor(protected readonly dataTable: InMemoryDataTable<TData>) {}

  insert(data: TData): Promise<void> {
    return new Promise((resolve) => {
      this.dataTable.insert(data)
      resolve()
    })
  }

  async deleteAll(): Promise<void> {
    return new Promise((resolve) => {
      this.dataTable.deleteAll()
      resolve()
    })
  }

  createIndex(keyPath: string, unique: boolean): Promise<void> {
    return new Promise((resolve) => {
      this.dataTable.createIndex(
        keyPath as keyof TData, // TODO keyPath type
        unique,
      )
      resolve()
    })
  }

  async getIndexNames(): Promise<Array<string>> {
    return new Promise((resolve) => {
      resolve(this.dataTable.getIndexNames())
    })
  }

  openCursor(
    indexName: Nullable<string>,
    direction: DatabaseCursorDirection,
  ): Promise<DatabaseCursor<TData>> {
    return new Promise((resolve) => {
      const keyPath = indexName ?? this.dataTable.getPrimaryKey()
      const cursor = this.dataTable.createCursor(
        keyPath as keyof TData, // TODO keyPath type
        direction,
      )
      resolve(cursor)
    })
  }
}
