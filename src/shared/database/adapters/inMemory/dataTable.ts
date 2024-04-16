import type { ColumnType, CreateIndexArgs } from '@shared/database/database'
import { emptyArray, emptySet } from '@shared/lib/utils/list'

export interface InMemoryDataTable<TData extends object> {
  name: string
  schema: {
    [K in keyof TData]: ColumnType
  }
  primaryKey: keyof TData
  rows: Array<TData>
  copyWithRows(rows: Array<TData>): InMemoryDataTable<TData>
  createIndex(args: CreateIndexArgs<TData>): void
  getIndexes(): Set<string>
}

export type InMemoryDataTables = Map<string, InMemoryDataTable<any>>

export class InMemoryDataTableImpl<TData extends object>
  implements InMemoryDataTable<TData>
{
  public rows: Array<TData> = emptyArray()
  protected indexes: Set<string> = emptySet()

  constructor(
    public name: string,
    public schema: {
      [K in keyof TData]: ColumnType
    },
    public primaryKey: keyof TData,
  ) {}

  copyWithRows(rows: Array<TData>): InMemoryDataTable<TData> {
    const copy = new InMemoryDataTableImpl(
      this.name,
      this.schema,
      this.primaryKey,
    )
    copy.rows = rows
    return copy
  }

  createIndex(args: CreateIndexArgs<TData>): void {
    this.indexes.add(args.keyPath as string)
  }

  getIndexes(): Set<string> {
    return this.indexes
  }
}
