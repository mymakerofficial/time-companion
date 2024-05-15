import type { ColumnType } from '@shared/database/types/database'
import type { PgColumnType } from '@shared/database/adapters/pglite/helpers/types'

const pgColumnTypeMap: Record<ColumnType, PgColumnType> = {
  string: 'text',
  number: 'integer',
  boolean: 'boolean',
}

export function genericTypeToPgType(type: ColumnType): PgColumnType {
  return pgColumnTypeMap[type]
}