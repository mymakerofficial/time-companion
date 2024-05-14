import { describe, it, expect } from 'vitest'
import createKnex from 'knex'
import { buildQuery } from '@shared/database/adapters/pglite/helpers/queryBuilder'
import { defineTable } from '@shared/database/schema/defineTable'
import { number, string } from '@shared/database/schema/columnBuilder'

describe('Knex Query Builder', () => {
  const knex = createKnex({
    client: 'pg',
  })

  const table = defineTable('table', {
    id: string().primaryKey(),
    stringColumn: string(),
    numberColumn: number(),
  })

  it('should build a query with all options', () => {
    const res = buildQuery(knex, table._.raw.tableName, {
      orderByTable: table._.raw.tableName,
      orderByColumn: table.stringColumn._.raw.columnName,
      oderByDirection: 'asc',
      limit: 10,
      offset: 5,
      where: table.stringColumn
        .equals('equalsString')
        .and(table.stringColumn.in(['in1', 'in2']))
        .and(table.stringColumn.contains('containsString'))
        .or(table.numberColumn.gte(18))._.raw,
    }).toSQL()

    expect(res).toEqual(
      expect.objectContaining({
        sql:
          'select * from "table" ' +
          'where ((((("table"."stringColumn" = ?) ' +
          'and ("table"."stringColumn" in (?, ?)) ' +
          'and ("table"."stringColumn" like ?))) ' +
          'or ("table"."numberColumn" >= ?))) ' +
          'order by "table"."stringColumn" asc ' +
          'limit ? ' +
          'offset ?',
        bindings: ['equalsString', 'in1', 'in2', 'containsString', 18, 10, 5],
      }),
    )
  })
})
