import type { ColumnType } from '@database/types/database'
import type { PgColumnType } from '@database/adapters/pglite/helpers/types'

const pgColumnTypeMap: Record<ColumnType, PgColumnType> = {
  text: 'text',
  integer: 'integer',
  double: 'double precision',
  boolean: 'boolean',
  datetime: 'timestamp with time zone',
  date: 'date',
  time: 'time',
  interval: 'interval',
  uuid: 'uuid',
  json: 'json',
}

export function genericTypeToPgType(type: ColumnType): PgColumnType {
  return pgColumnTypeMap[type]
}
