import { describe, expect, it } from 'vitest'
import createKnex from 'knex'
import {
  buildAlterTable,
  buildCreateTable,
} from '@shared/database/adapters/pglite/helpers/schemaBuilder'
import { defineTable } from '@shared/database/schema/defineTable'
import { t } from '@shared/database/schema/columnBuilder'
import { AlterTableBuilderImpl } from '@shared/database/schema/alterTable'

describe('Knex Schema Builder', () => {
  const knex = createKnex({
    client: 'pg',
  })

  describe('buildCreateTable', () => {
    it('should build a create table', () => {
      const schema = defineTable('table', {
        id: t.uuid().primaryKey(),
        stringColumn: t.string().indexed().unique().nullable(),
        numberColumn: t.number(),
      })

      const builder = buildCreateTable(knex, schema._.raw)

      expect(builder.toQuery()).toEqual(
        'create table "table" ("id" uuid, "stringColumn" text null, "numberColumn" double precision, constraint "table_pkey" primary key ("id"));\n' +
          'create index "table_stringcolumn_index" on "table" ("stringColumn");\n' +
          'alter table "table" add constraint "table_stringcolumn_unique" unique ("stringColumn")',
      )
    })
  })

  describe('buildAlterTable', () => {
    it('should rename a table', () => {
      const table = new AlterTableBuilderImpl()

      table.renameTo('newTable')

      const builder = buildAlterTable(knex, 'table', table._.actions)

      expect(builder.toQuery()).toEqual(
        'alter table "table" rename to "newTable"',
      )
    })

    it('should add a column', () => {
      const table = new AlterTableBuilderImpl()

      table.addColumn('name').string().nullable()

      const builder = buildAlterTable(knex, 'table', table._.actions)

      expect(builder.toQuery()).toEqual(
        'alter table "table" add column "name" text null',
      )
    })

    it('should add a column with index and unique', () => {
      const table = new AlterTableBuilderImpl()

      table.addColumn('name').string().nullable().unique().indexed()

      const builder = buildAlterTable(knex, 'table', table._.actions)

      expect(builder.toQuery()).toEqual(
        'alter table "table" add column "name" text null;\n' +
          'create index "table_name_index" on "table" ("name");\n' +
          'alter table "table" add constraint "table_name_unique" unique ("name")',
      )
    })

    it('should drop a column', () => {
      const table = new AlterTableBuilderImpl()

      table.dropColumn('age')

      const builder = buildAlterTable(knex, 'table', table._.actions)

      expect(builder.toQuery()).toEqual('alter table "table" drop column "age"')
    })

    it('should rename a column', () => {
      const table = new AlterTableBuilderImpl()

      table.renameColumn('email', 'emailAddress')

      const builder = buildAlterTable(knex, 'table', table._.actions)

      expect(builder.toQuery()).toEqual(
        'alter table "table" rename "email" to "emailAddress"',
      )
    })

    it('should alter a column', () => {
      const table = new AlterTableBuilderImpl()

      table
        .alterColumn('emailAddress')
        .setDataType('string')
        .dropNullable()
        .setIndexed()
        .setUnique()

      const builder = buildAlterTable(knex, 'table', table._.actions)

      expect(builder.toQuery()).toEqual(
        'alter table "table" alter column "emailAddress" drop default;\n' +
          'alter table "table" alter column "emailAddress" type text using ("emailAddress"::text);\n' +
          'alter table "table" alter column "emailAddress" set not null;\n' +
          'create index "table_emailaddress_index" on "table" ("emailAddress");\n' +
          'alter table "table" add constraint "table_emailaddress_unique" unique ("emailAddress")',
      )
    })
  })
})
