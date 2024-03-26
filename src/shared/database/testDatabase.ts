import type {
  CreateTableArgs,
  Database,
  Table,
} from '@shared/database/database'
import { createSingleton } from '@shared/lib/helpers/createSingleton'
import { todo } from '@shared/lib/utils/todo'

export const testDatabase = createSingleton<[], Database>(() => ({
  table<TData extends object>(tableName: string): Table<TData> {
    return todo()
  },
  join<TLeftData extends object, TRightData extends object>(
    leftTableName: string,
    rightTableName: string,
  ) {
    return todo()
  },
  createTable(args: CreateTableArgs): Promise<void> {
    return todo()
  },
}))
