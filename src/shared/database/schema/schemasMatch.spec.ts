import { describe, expect, it } from 'vitest'
import { rawTableSchemasMatch } from '@shared/database/schema/schemasMatch'
import { defineTable } from '@shared/database/schema/defineTable'
import { c } from '@shared/database/schema/columnBuilder'

describe('rawTableSchemasMatch', () => {
  it('should return true if everything matches', () => {
    const table = defineTable('table', {
      id: c.uuid().primaryKey(),
      textColumn: c.text().nullable(),
      numberColumn: c.number().indexed().unique(),
    })

    expect(rawTableSchemasMatch(table._.raw, table._.raw)).toBe(true)
  })

  it('should return false if the table name doesnt match', () => {
    const tableA = defineTable('table_a', {
      id: c.uuid().primaryKey(),
      textColumn: c.text().nullable(),
      numberColumn: c.number().indexed().unique(),
    })

    const tableB = defineTable('table_b', {
      id: c.uuid().primaryKey(),
      textColumn: c.text().nullable(),
      numberColumn: c.number().indexed().unique(),
    })

    expect(rawTableSchemasMatch(tableA._.raw, tableB._.raw)).toBe(false)
  })

  it('should return false if the attribute is missing', () => {
    const tableA = defineTable('table', {
      id: c.uuid().primaryKey(),
      textColumn: c.text().nullable(),
      numberColumn: c.number().indexed().unique(),
    })

    const tableB = defineTable('table', {
      id: c.uuid().primaryKey(),
      textColumn: c.text(),
      numberColumn: c.number().indexed().unique(),
    })

    expect(rawTableSchemasMatch(tableA._.raw, tableB._.raw)).toBe(false)
  })

  it('should return false if column is missing', () => {
    const tableA = defineTable('table', {
      id: c.uuid().primaryKey(),
      textColumn: c.text().nullable(),
      numberColumn: c.number().indexed().unique(),
    })

    const tableB = defineTable('table', {
      id: c.uuid().primaryKey(),
      textColumn: c.text().nullable(),
    })

    expect(rawTableSchemasMatch(tableA._.raw, tableB._.raw)).toBe(false)
  })

  it('should return false if column is extra', () => {
    const tableA = defineTable('table', {
      id: c.uuid().primaryKey(),
      textColumn: c.text().nullable(),
    })

    const tableB = defineTable('table', {
      id: c.uuid().primaryKey(),
      textColumn: c.text().nullable(),
      numberColumn: c.number().indexed().unique(),
    })

    expect(rawTableSchemasMatch(tableA._.raw, tableB._.raw)).toBe(false)
  })
})
