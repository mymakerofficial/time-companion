import type { ColumnType } from '@shared/database/types/database'

export type DatabaseColumnDefinitionRaw<T> = {
  name: string
  type: ColumnType
  isPrimaryKey?: boolean
  isNullable?: boolean
}

export type DatabaseColumnDefinitionInput<T> = Omit<
  DatabaseColumnDefinitionRaw<T>,
  'name'
>

export type DatabaseTableSchemaRaw<TData extends object> = {
  tableName: string
  primaryKey: string
  columns: Array<DatabaseColumnDefinitionRaw<unknown>>
}

export type DatabaseTableSchema<TData extends object> = {
  _raw: DatabaseTableSchemaRaw<TData>
}

export type InferTableType<T> =
  T extends DatabaseTableSchema<infer U> ? U : never
