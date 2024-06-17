import type { TableSchemaRaw } from '@shared/database/types/schema'
import { entriesOf, objectFromEntries } from '@shared/lib/utils/object'
import type { ColumnType } from '@shared/database/types/database'
import {
  check,
  isDefined,
  isNotNull,
  isNull,
  isString,
} from '@shared/lib/utils/checks'
import type { Nullable, Pair } from '@shared/lib/utils/types'
import { Temporal } from 'temporal-polyfill'

export type SerializedTime = {
  __dataType__: 'time'
  original: Nullable<string>
  totalSeconds: number
}

export type SerializedInterval = {
  __dataType__: 'interval'
  original: Nullable<string>
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
    return [
      key,
      serializeColumn(value, column.dataType, column.isNullable),
    ] as Pair<keyof TRow, any>
  })

  return objectFromEntries(
    // filter out undefined entries to avoid getting an object with undefined values.
    //  yes there is a difference between an undefined value and a missing key
    mappedEntries.filter(([, value]) => isDefined(value)),
  ) as object
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

function serializeColumn(
  value: unknown,
  dataType: ColumnType,
  isNullable: boolean,
): any {
  check(
    isNullable || isNotNull(value),
    'Value of a not nullable column must not be null',
  )

  switch (dataType) {
    case 'time':
      check(isNull(value) || isString(value), 'Time must be a string')
      return serializeTime(value)
    case 'interval':
      check(isNull(value) || isString(value), 'Interval must be a string')
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

function serializeTime(value: Nullable<string>): SerializedTime {
  return {
    __dataType__: 'time',
    original: value,
    totalSeconds: value
      ? Temporal.PlainTime.from({ second: 0 })
          .until(value)
          .total({ unit: 'seconds' })
      : -Infinity,
  }
}

function deserializeTime(value: SerializedTime): Nullable<string> {
  return value.original
}

function serializeInterval(value: Nullable<string>): SerializedInterval {
  return {
    __dataType__: 'interval',
    original: value,
    totalSeconds: value
      ? Temporal.Duration.from(value).total({ unit: 'seconds' })
      : -Infinity,
  }
}

function deserializeInterval(value: SerializedInterval): Nullable<string> {
  return value.original
}
