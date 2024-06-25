import { describe, expect, it } from 'vitest'
import { knex as createKnex } from 'knex'
import { buildQuery } from '@database/adapters/pglite/helpers/queryBuilder'
import { c } from '@database/schema/columnBuilder'

describe('Knex Query Builder', () => {
  const knex = createKnex({
    client: 'pg',
  })

  it('should build a query with orderBy', () => {
    const sql = buildQuery(knex, 'table', {
      orderBy: c('table', 'stringColumn').asc(),
    }).toQuery()

    expect(sql).toEqual(
      'select * from "table" order by "table"."stringColumn" asc',
    )
  })

  it('should build a query with limit', () => {
    const sql = buildQuery(knex, 'table', {
      limit: 10,
    }).toQuery()

    expect(sql).toEqual('select * from "table" limit 10')
  })

  it('should build a query with offset', () => {
    const sql = buildQuery(knex, 'table', {
      offset: 5,
    }).toQuery()

    expect(sql).toEqual('select * from "table" offset 5')
  })

  it('should build a query with where', () => {
    const sql = buildQuery(knex, 'table', {
      where: c('table', 'stringColumn').equals('testString')._.raw,
    }).toQuery()

    expect(sql).toEqual(
      'select * from "table" where ("table"."stringColumn" = \'testString\')',
    )
  })

  it('should combine range and where', () => {
    const sql = buildQuery(knex, 'table', {
      range: c('numberColumn').range.between(18, 99),
      where: c('stringColumn').equals('testString')._.raw,
    }).toQuery()

    expect(sql).toEqual(
      'select * from "table" where ((("stringColumn" = \'testString\') and ((("numberColumn" >= 18) and ("numberColumn" <= 99)))))',
    )
  })

  it('should build a query with all options', () => {
    const sql = buildQuery(knex, 'table', {
      orderBy: c('stringColumn').asc(),
      limit: 10,
      offset: 5,
      range: c('numberColumn').range.between(18, 99),
      where: c('stringColumn')
        .equals('equalsString')
        .and(c('stringColumn').in(['in1', 'in2']))
        .or(c('stringColumn').contains('containsString'))._.raw,
    }).toQuery()

    expect(sql).toEqual(
      'select * from "table" where ((((((("stringColumn" = \'equalsString\') and ("stringColumn" in (\'in1\', \'in2\')))) or ("stringColumn" like \'containsString\'))) and ((("numberColumn" >= 18) and ("numberColumn" <= 99))))) order by "stringColumn" asc limit 10 offset 5',
    )
  })
})
