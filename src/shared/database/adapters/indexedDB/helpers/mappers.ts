import type { TableSchemaRaw } from '@shared/database/types/schema'
import { entriesOf, objectFromEntries } from '@shared/lib/utils/object'
import type { ColumnType } from '@shared/database/types/database'
import { check, isNotNull, isString } from '@shared/lib/utils/checks'
import type { Pair } from '@shared/lib/utils/types'
import { Temporal } from 'temporal-polyfill'

export type SerializedTime = {
  __dataType__: 'time'
  original: string
  totalSeconds: number
}

export type SerializedInterval = {
  __dataType__: 'interval'
  original: string
  totalSeconds: number
}

export function serializeRow<TRow extends object>(
  row: Partial<TRow>,
  schema: TableSchemaRaw<TRow>,
) {
  const entries = entriesOf(row)
  const mappedEntries = entries.map(([key, value]) => {
    const column = schema.columns[key]
    check(
      isNotNull(column.dataType),
      'Column definition must not be null for key',
    )
    return [key, serializeColumn(value, column.dataType)] as Pair<
      keyof TRow,
      any
    >
  })

  return objectFromEntries(mappedEntries) as object
}

export function deserializeRow<TRow extends object>(
  row: object,
  schema: TableSchemaRaw<TRow>,
) {
  const entries = entriesOf(row)
  const mappedEntries = entries.map(([key, value]) => {
    const column = schema.columns[key as keyof TRow]
    check(
      isNotNull(column.dataType),
      'Column definition must not be null for key',
    )
    return [key, deserializeColumn(value, column.dataType)] as Pair<
      keyof TRow,
      any
    >
  })

  return objectFromEntries(mappedEntries)
}

function serializeColumn(value: unknown, dataType: ColumnType): any {
  switch (dataType) {
    case 'time':
      check(isString(value), 'Time must be a string')
      return serializeTime(value)
    case 'interval':
      check(isString(value), 'Interval must be a string')
      return serializeInterval(value)
    default:
      return value
  }
}

function deserializeColumn(value: unknown, dataType: ColumnType): any {
  switch (dataType) {
    case 'time':
      return deserializeTime(value as SerializedTime)
    case 'interval':
      return deserializeInterval(value as SerializedInterval)
    default:
      return value
  }
}

function serializeTime(value: string): SerializedTime {
  return {
    __dataType__: 'time',
    original: value,
    totalSeconds: Temporal.PlainTime.from({ second: 0 })
      .until(value)
      .total({ unit: 'seconds' }),
  }
}

function deserializeTime(value: SerializedTime): string {
  return value.original
}

function serializeInterval(value: string): SerializedInterval {
  return {
    __dataType__: 'interval',
    original: value,
    totalSeconds: Temporal.Duration.from(value).total({ unit: 'seconds' }),
  }
}

function deserializeInterval(value: SerializedInterval): string {
  return value.original
}
