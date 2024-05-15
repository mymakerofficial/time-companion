import type { AdapterBaseQueryProps } from '@shared/database/types/adapter'
import type { Knex } from 'knex'
import { isPresent } from '@shared/lib/utils/checks'
import type { RawWhere } from '@shared/database/types/schema'
import { genericOperatorToPgOperator } from '@shared/database/adapters/pglite/helpers/genericOperatorToPgOperator'

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

  if (isPresent(props.where)) {
    builder.where(buildWhere(props.where))
  }

  if (isPresent(props.orderByTable) && isPresent(props.orderByColumn)) {
    builder.orderBy(
      `${props.orderByTable}.${props.orderByColumn}`,
      props.oderByDirection,
    )
  }

  return builder
}

export function buildWhere(
  where: RawWhere,
): (builder: Knex.QueryBuilder) => void {
  return (builder) => {
    if (where.type === 'condition') {
      builder.where(
        `${where.column.tableName}.${where.column.columnName}`,
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