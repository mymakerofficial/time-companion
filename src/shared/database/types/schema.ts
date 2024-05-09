import type { ColumnType } from '@shared/database/types/database'

export type DatabaseColumnDefinition<T> = {
  getRaw: () => DatabaseColumnDefinitionRaw<T>
}

export type DatabaseColumnDefinitionRaw<T> = {
  name: string
  type: ColumnType
  isPrimaryKey: boolean
  isNullable: boolean
}

export type DatabaseColumnDefinitionBuilder<T> = {
  getRaw: () => DatabaseColumnDefinitionRaw<T>
  primaryKey: () => DatabaseColumnDefinitionBuilder<T>
  nullable: () => DatabaseColumnDefinitionBuilder<T>
} & {
  [K in ColumnType]: () => DatabaseColumnDefinitionBuilder<T>
}

export type DatabaseTableSchemaRaw<TData extends object> = {
  tableName: string
  primaryKey: string
  columns: Array<DatabaseColumnDefinitionRaw<unknown>>
}

export type DatabaseTableSchema<TData extends object> = {
  getRaw: () => DatabaseTableSchemaRaw<TData>
} & {
  [K in keyof TData]: DatabaseColumnDefinition<TData[K]>
}

export type InferTableType<T> =
  T extends DatabaseTableSchema<infer U> ? U : never
