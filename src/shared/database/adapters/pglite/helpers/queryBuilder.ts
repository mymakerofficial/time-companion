import type { AdapterBaseQueryProps } from '@database/types/adapter'
import type { Knex } from 'knex'
import { check, isNotNull, isNull, isPresent } from '@shared/lib/utils/checks'
import type { ColumnDefinitionRaw, RawWhere } from '@database/types/schema'
import { genericOperatorToPgOperator } from '@database/adapters/pglite/helpers/genericOperatorToPgOperator'
import type { Maybe, Nullable } from '@shared/lib/utils/types'
import type { KeyRange } from '@database/types/database'
import { getOrNull } from '@shared/lib/utils/result'

export function buildQuery(
  knex: Knex,
  tableName: string,
  props: Partial<AdapterBaseQueryProps>,
) {
  const builder = knex.from(tableName)

  if (isPresent(props.limit)) {
    builder.limit(props.limit)
  }

  if (isPresent(props.offset)) {
    builder.offset(props.offset)
  }

  const combinedWhere = combineWhereAndRange(props.where, props.range)

  if (isNotNull(combinedWhere)) {
    builder.where(buildWhere(combinedWhere))
  }

  if (isPresent(props.orderBy)) {
    builder.orderBy(
      getColumnAccessor(props.orderBy.column),
      props.orderBy.direction,
    )
  }

  return builder
}

function rangeToWhere(range: KeyRange): RawWhere {
  return {
    type: 'booleanGroup',
    booleanOperator: 'and',
    conditions: [
      range.lower
        ? {
            type: 'condition',
            column: range.column,
            operator: range.lowerOpen ? 'greaterThan' : 'greaterThanOrEquals',
            value: range.lower,
          }
        : null,
      range.upper
        ? {
            type: 'condition',
            column: range.column,
            operator: range.upperOpen ? 'lessThan' : 'lessThanOrEquals',
            value: range.upper,
          }
        : null,
    ].filter(isNotNull) as RawWhere[],
  }
}

function combineWhereAndRange(
  where: Maybe<RawWhere>,
  range: Maybe<KeyRange>,
): Nullable<RawWhere> {
  const nullableWhere = getOrNull(where)
  const nullableRange = getOrNull(range)

  if (isNull(nullableWhere) && isNull(nullableRange)) {
    return null
  }

  if (isNull(nullableRange)) {
    return nullableWhere
  }

  if (isNull(nullableWhere)) {
    return rangeToWhere(nullableRange)
  }

  return {
    type: 'booleanGroup',
    booleanOperator: 'and',
    conditions: [nullableWhere, rangeToWhere(nullableRange)],
  }
}

export function buildWhere(
  where: RawWhere,
): (builder: Knex.QueryBuilder) => void {
  return (builder) => {
    if (where.type === 'condition') {
      builder.where(
        getColumnAccessor(where.column),
        genericOperatorToPgOperator(where.operator),
        where.value,
      )
    }

    if (where.type === 'booleanGroup') {
      builder.where((innerBuilder) => {
        where.conditions.forEach((condition) => {
          innerBuilder[
            where.booleanOperator === 'and' ? 'andWhere' : 'orWhere'
          ](buildWhere(condition))
        })
      })
    }
  }
}

function getColumnAccessor(column: ColumnDefinitionRaw) {
  check(isNotNull(column.columnName), 'Column must have a column name')

  if (isNull(column.tableName)) {
    return column.columnName
  }

  return `${column.tableName}.${column.columnName}`
}
