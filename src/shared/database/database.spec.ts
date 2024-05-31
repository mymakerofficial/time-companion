import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { faker } from '@faker-js/faker'
import { asArray, emptyArray, firstOf, lastOf } from '@shared/lib/utils/list'
import { randomElement, randomElements } from '@shared/lib/utils/random'
import { useDatabaseFixtures } from '@test/fixtures/database/databaseFixtures'
import type { Person } from '@test/fixtures/database/types'
import type { HasId } from '@shared/model/helpers/hasId'
import { uuid } from '@shared/lib/utils/uuid'
import { createDatabase } from '@shared/database/factory/database'
import { indexedDBAdapter } from '@shared/database/adapters/indexedDB/database'
import config from '@test/fixtures/database/config'
import { pgliteAdapter } from '@shared/database/adapters/pglite/database'
import type {
  Database,
  UpgradeTransaction,
} from '@shared/database/types/database'
import { c } from '@shared/database/schema/columnBuilder'
import 'fake-indexeddb/auto'
import { defineConfig } from '@shared/database/schema/defineConfig'
import { personsTable, petsTable } from '@test/fixtures/database/schema'

function byId(a: HasId, b: HasId) {
  return a.id.localeCompare(b.id)
}

function byFirstName(a: Person, b: Person) {
  return a.firstName.localeCompare(b.firstName)
}

function byLastName(a: Person, b: Person) {
  return a.lastName.localeCompare(b.lastName)
}

function byAge(a: Person, b: Person) {
  return a.age - b.age
}

function whereFirstNameEquals(firstName: string) {
  return (person: Person) => person.firstName === firstName
}

function whereAgeGreaterThanOrEqual(age: number) {
  return (person: Person) => person.age >= age
}

describe.each([
  ['IndexedDB', () => indexedDBAdapter(`test-database-${uuid()}`)],
  [
    'PGLite',
    (persist: boolean = false) =>
      pgliteAdapter(`${persist ? 'idb' : 'memory'}://test-database-${uuid()}`),
  ],
])('Adapter "%s"', (adapterName, adapterFactory) => {
  describe('unsafe', () => {
    describe('truncate', () => {
      it('should reset the database', async () => {
        const database = createDatabase(adapterFactory(), {
          migrations: [
            async (_) => {},
            async (transaction) => {
              await transaction.createTable('test', {
                id: c.uuid().primaryKey(),
              })
            },
          ],
        })

        expect(database.isOpen).toBe(false)

        await database.open()

        expect(await database.getActualTableNames()).toEqual(['test'])
        expect(database.version).toEqual(2)

        await database.unsafe.dropSchema()

        expect(await database.getActualTableNames()).toEqual([])
        expect(database.version).toEqual(0)
        expect(database.isOpen).toBe(true)
      })
    })
  })

  describe('open', () => {
    const migration001 = vi.fn(
      () => import('@test/fixtures/database/migrations/001_add_persons'),
    )
    const migration002 = vi.fn(
      () => import('@test/fixtures/database/migrations/002_add_pets'),
    )

    it('should open a new database and run all migration', async () => {
      const database = createDatabase(adapterFactory(), {
        migrations: [migration001, migration002],
      })

      expect(database.isOpen).toBe(false)
      expect(database.version).toBe(0)
      expect(migration001).not.toHaveBeenCalled()
      expect(migration002).not.toHaveBeenCalled()

      await database.open()

      expect(database.isOpen).toBe(true)
      expect(database.version).toBe(2)
      expect(migration001).toHaveBeenCalled()
      expect(migration002).toHaveBeenCalled()

      expect(
        async () => await database.table('persons').findMany(),
      ).toBeDefined()
      expect(async () => await database.table('pets').findMany()).toBeDefined()
    })

    it('should generate runtime schema on a new and existing database', async () => {
      const adapter = adapterFactory(true)

      const config = defineConfig({
        migrations: [migration001, migration002],
        schema: {
          persons: personsTable,
          pets: petsTable,
        },
      })

      const database1 = createDatabase(adapter, config)

      await database1.open()

      const originalRuntimeSchema = database1.unsafe.getRuntimeSchema()

      await database1.close()

      const database2 = createDatabase(adapter, config)

      await database2.open()

      const newRuntimeSchema = database2.unsafe.getRuntimeSchema()

      expect(newRuntimeSchema).toEqual(originalRuntimeSchema)

      await database2.close()
    })
  })

  describe('migrations', () => {
    const migration001 = vi.fn(
      () => import('@test/fixtures/database/migrations/001_add_persons'),
    )
    const migration002 = vi.fn(
      () => import('@test/fixtures/database/migrations/002_add_pets'),
    )

    let database: Database

    beforeAll(async () => {
      database = createDatabase(adapterFactory(), {
        migrations: [],
      })

      await database.open()
    })

    afterEach(async () => {
      await database.unsafe.dropSchema()
      database.unsafe.setConfigSchema({})
      database.unsafe.setMigrations([])
      migration001.mockClear()
      migration002.mockClear()
    })

    it('should migrate an existing database to the latest version', async () => {
      database.unsafe.setMigrations([migration001])
      await database.unsafe.migrate()

      expect(database.version).toBe(1)
      expect(migration001).toHaveBeenCalled()
      expect(migration002).not.toHaveBeenCalled()

      migration001.mockClear()
      migration002.mockClear()

      database.unsafe.setMigrations([migration001, migration002])
      await database.unsafe.migrate()

      expect(database.version).toBe(2)
      expect(migration001).not.toHaveBeenCalled()
      expect(migration002).toHaveBeenCalled()
    })

    it('should rollback the migration if an error occurs', async () => {
      const migrationWithInsert = vi.fn(
        async (transaction: UpgradeTransaction) => {
          await transaction.table<Person>('persons').insert({
            data: {
              id: uuid(),
              username: 'johndoe',
              firstName: 'John',
              lastName: 'Doe',
              gender: faker.person.gender(),
              age: 30,
            },
          })
        },
      )

      const migrationWithError = vi.fn(
        async (transaction: UpgradeTransaction) => {
          await transaction.createTable('pets', {
            id: c.uuid().primaryKey(),
          })

          throw new Error('Error in migration')
        },
      )

      const migrationWithCreateTable = vi.fn(
        async (transaction: UpgradeTransaction) => {
          await transaction.createTable('foo', {
            id: c.uuid().primaryKey(),
          })
        },
      )

      database.unsafe.setMigrations([migration001])
      await database.unsafe.migrate()

      expect(database.version).toBe(1)

      migration001.mockClear()

      database.unsafe.setMigrations([
        migration001,
        migrationWithInsert,
        migrationWithError,
        migrationWithCreateTable,
      ])

      await expect(database.unsafe.migrate()).rejects.toThrowError(
        'Error in migration',
      )

      expect(database.isOpen).toBe(true)
      expect(database.version).toBe(1)
      expect(migration001).not.toHaveBeenCalled()
      expect(migrationWithInsert).toHaveBeenCalled()
      expect(migrationWithError).toHaveBeenCalled()
      expect(migrationWithCreateTable).not.toHaveBeenCalled()

      expect(await database.getActualTableNames()).toEqual(['persons'])
    })

    it('should not migrate a database that is already at the latest version', async () => {
      database.unsafe.setMigrations([migration001, migration002])
      await database.unsafe.migrate()

      expect(database.version).toBe(2)
      expect(migration001).toHaveBeenCalled()
      expect(migration002).toHaveBeenCalled()

      migration001.mockClear()
      migration002.mockClear()

      database.unsafe.setMigrations([migration001, migration002])
      await database.unsafe.migrate()

      expect(database.version).toBe(2)
      expect(migration001).not.toHaveBeenCalled()
      expect(migration002).not.toHaveBeenCalled()
    })

    describe('upgrade transaction', async () => {
      describe('createTable', async () => {
        it('should create a new table', async () => {
          expect(database.getTableNames()).not.toContain('persons')
          expect(await database.getActualTableNames()).not.toContain('persons')

          await database.unsafe.runMigration(async (transaction) => {
            await transaction.createTable('persons', {
              id: c.uuid().primaryKey(),
              username: c.string(),
            })
          })

          expect(database.getTableNames()).toContain('persons')
          expect(await database.getActualTableNames()).toContain('persons')

          expect(database.table('persons').getColumnNames()).toEqual([
            'id',
            'username',
          ])
        })
      })

      describe('dropTable', () => {
        it('should drop a table', async () => {
          await database.unsafe.runMigration(async (transaction) => {
            await transaction.createTable('persons', {
              id: c.uuid().primaryKey(),
              username: c.string(),
            })
          })

          expect(database.getTableNames()).toContain('persons')
          expect(await database.getActualTableNames()).toContain('persons')

          await database.unsafe.runMigration(async (transaction) => {
            await transaction.dropTable('persons')
          })

          expect(database.getTableNames()).not.toContain('persons')
          expect(await database.getActualTableNames()).not.toContain('persons')
        })
      })

      describe('alterTable', () => {
        describe('renameTo', () => {
          it('should rename a table and retain its data', async () => {
            await database.unsafe.runMigration(async (transaction) => {
              await transaction.createTable('persons', {
                id: c.uuid().primaryKey(),
                username: c.string(),
              })
            })

            expect(database.getTableNames()).toContain('persons')
            expect(await database.getActualTableNames()).toContain('persons')

            await database.table('persons').insert({
              data: {
                id: uuid(),
                username: 'johndoe',
              },
            })

            expect(database.table('persons').findFirst()).resolves.toEqual({
              id: expect.any(String),
              username: 'johndoe',
            })

            await database.unsafe.runMigration(async (transaction) => {
              await transaction.alterTable('persons', (table) => {
                table.renameTo('users')
              })
            })

            expect(database.getTableNames()).toContain('users')
            expect(await database.getActualTableNames()).toContain('users')

            expect(database.table('users').getColumnNames()).toEqual([
              'id',
              'username',
            ])

            expect(database.table('users').findFirst()).resolves.toEqual({
              id: expect.any(String),
              username: 'johndoe',
            })
          })

          it.skip('should fail when trying to rename to a table that already exists', async () => {
            // fails because migration fails but thats what we want

            await database.unsafe.runMigration(async (transaction) => {
              await transaction.createTable('foo', {
                id: c.uuid().primaryKey(),
              })

              await transaction.createTable('bar', {
                id: c.uuid().primaryKey(),
              })
            })

            expect(
              database.unsafe.runMigration(async (transaction) => {
                await transaction.alterTable('foo', (table) => {
                  table.renameTo('bar')
                })
              }),
            ).rejects.toThrowError('Table "bar" already exists.')
          })
        })

        describe('addColumn', () => {
          it.todo('should add a column and fill it with a default value')
        })

        describe('renameColumn', () => {
          it('should rename a column and retain its data', async () => {
            await database.unsafe.runMigration(async (transaction) => {
              await transaction.createTable('users', {
                id: c.uuid().primaryKey(),
                name: c.string(),
              })
            })

            expect(database.table('users').getColumnNames()).toEqual([
              'id',
              'name',
            ])

            await database.table('users').insert({
              data: {
                id: uuid(),
                name: 'John Doe',
              },
            })

            expect(database.table('users').findFirst()).resolves.toEqual({
              id: expect.any(String),
              name: 'John Doe',
            })

            await database.unsafe.runMigration(async (transaction) => {
              await transaction.alterTable('users', (table) => {
                table.renameColumn('name', 'userName')
              })
            })

            expect(database.table('users').findFirst()).resolves.toEqual({
              id: expect.any(String),
              userName: 'John Doe',
            })

            expect(database.table('users').getColumnNames()).toEqual([
              'id',
              'userName',
            ])
          })
        })

        describe('alterColumn', () => {
          it.todo('should change the data type of a column')
        })

        describe('dropColumn', () => {
          it('should drop a column and its data', async () => {
            await database.unsafe.runMigration(async (transaction) => {
              await transaction.createTable('users', {
                id: c.uuid().primaryKey(),
                name: c.string(),
              })
            })

            await database.table('users').insert({
              data: {
                id: uuid(),
                name: 'John Doe',
              },
            })

            expect(database.table('users').findFirst()).resolves.toEqual({
              id: expect.any(String),
              name: 'John Doe',
            })

            await database.unsafe.runMigration(async (transaction) => {
              await transaction.alterTable('users', (table) => {
                table.dropColumn('name')
              })
            })

            expect(database.table('users').findFirst()).resolves.toEqual({
              id: expect.any(String),
            })
          })
        })
      })
    })
  })

  describe('queries', () => {
    const { database, helpers, personsTable, petsTable } = useDatabaseFixtures({
      database: createDatabase(adapterFactory(), config),
    })

    beforeAll(async () => {
      await database.open()
    })

    afterAll(async () => {
      await helpers.cleanup()
    })

    describe('table', () => {
      afterEach(async () => {
        await helpers.clearDatabase()
      })

      it('only getting the table should not throw', () => {
        expect(() => database.table('non_existent_table')).not.toThrow()
      })

      describe('insert', () => {
        it('should insert data', async () => {
          const samplePerson = helpers.samplePerson()

          const res = await database.table(personsTable).insert({
            data: samplePerson,
          })

          const personsInDatabase = await helpers.getAllPersonsInDatabase()

          expect(res).toEqual(samplePerson)
          expect(personsInDatabase).toEqual(asArray(samplePerson))
        })

        it('should fail when the table does not exist', async () => {
          const samplePerson = helpers.samplePerson()

          await expect(
            database.table('non_existent_table').insert({
              data: samplePerson,
            }),
          ).rejects.toThrowError('Table "non_existent_table" does not exist.')
        })

        it('should fail when trying to insert a row with a column that does not exist on table', async () => {
          const personWithWrongColumn = {
            ...helpers.samplePerson(),
            foo: 'bar',
          }

          await expect(
            database.table(personsTable).insert({
              data: personWithWrongColumn,
            }),
          ).rejects.toThrowError(
            `Column "foo" of table "persons" does not exist.`,
          )
        })

        it('should fail when trying to insert a value that violates a unique constraint', async () => {
          await helpers.insertSamplePersons(6)
          await helpers.insertSamplePerson({
            username: 'johndoe',
          })

          const newPersonWithSameUsername = helpers.samplePerson({
            username: 'johndoe',
          })

          await expect(
            database.table(personsTable).insert({
              data: newPersonWithSameUsername,
            }),
          ).rejects.toThrowError(
            `Unique constraint violated on column "username".`,
          )
        })

        it('should fail when trying to insert a row with missing required columns', async () => {
          await expect(
            database.table(personsTable).insert({
              // @ts-expect-error
              data: {
                id: uuid(), // a missing primaryKey would be another error
              },
            }),
          ).rejects.toThrowError(
            'Column "firstName" of table "persons" cannot be null.',
          )
        })
      })

      describe('insertMany', () => {
        it('should insert data', async () => {
          const samplePersons = helpers.samplePersons(3)

          const res = await database.table(personsTable).insertMany({
            data: samplePersons,
          })

          const personsInDatabase = await helpers.getAllPersonsInDatabase()

          expect(res.sort(byId)).toEqual(samplePersons.sort(byId))
          expect(personsInDatabase.sort(byId)).toEqual(samplePersons.sort(byId))
        })
      })

      describe('findFirst', () => {
        it('should return a value that was inserted', async () => {
          const samplePersons = await helpers.insertSamplePersons(3)

          const res = await database.table(personsTable).findFirst()

          expect(samplePersons).toContainEqual(res)
        })

        it('should find unique entry in a table', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)
          const randomPerson = randomElement(samplePersons, {
            safetyOffset: 1,
          })

          const res = await database.table(personsTable).findFirst({
            where: personsTable.id.equals(randomPerson.id),
          })

          expect(res).toEqual(randomPerson)
        })

        it('should find a unique entry using a range', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)
          const randomPerson = randomElement(samplePersons, {
            safetyOffset: 1,
          })

          const res = await database.table(personsTable).findFirst({
            range: personsTable.id.range.only(randomPerson.id),
          })

          expect(res).toEqual(randomPerson)
        })

        it('should find a single entry in a table with order ascending', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findFirst({
            orderBy: personsTable.firstName.asc(),
          })

          expect(res).toEqual(firstOf(samplePersons.sort(byFirstName)))
        })

        it('should find the first entry in a table sorted descending', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findFirst({
            orderBy: personsTable.firstName.desc(),
          })

          expect(res).toEqual(lastOf(samplePersons.sort(byFirstName)))
        })

        it('should find a single entity in a table with using and filters', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)
          const randomPerson = randomElement(samplePersons, {
            safetyOffset: 1,
          })

          const res = await database.table(personsTable).findFirst({
            where: personsTable.firstName
              .equals(randomPerson.firstName)
              .and(personsTable.age.equals(randomPerson.age))
              .and(personsTable.id.notEquals(uuid())), // non-existent id
          })

          expect(res).toEqual(randomPerson)
        })

        it('should return null when no entry is found', async () => {
          await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findFirst({
            where: personsTable.id.equals(uuid()), // non-existent id
          })

          expect(res).toBeNull()
        })
      })

      describe('findMany', () => {
        it('should find all entries in a table', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findMany()

          expect(res.sort(byId)).toEqual(samplePersons.sort(byId))
        })

        it('should find all entries in a table with a filter', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)
          const randomPerson = randomElement(samplePersons, {
            safetyOffset: 1,
          })

          const res = await database.table(personsTable).findMany({
            where: personsTable.firstName.equals(randomPerson.firstName),
          })

          expect(res.sort(byId)).toEqual(
            samplePersons
              .filter((person) => person.firstName === randomPerson.firstName)
              .sort(byId),
          )
        })

        it('should find all entries in a table with a range', async () => {
          await helpers.insertSamplePersons(6, {
            age: [10, 20, 30, 40, 50, 60],
          })

          const res = await database.table(personsTable).findMany({
            range: personsTable.age.range.between(20, 40),
          })

          expect(res.sort(byAge)).toEqual([
            expect.objectContaining({
              age: 20,
            }),
            expect.objectContaining({
              age: 30,
            }),
            expect.objectContaining({
              age: 40,
            }),
          ])
        })

        it('should correctly combine where and range filters', async () => {
          await helpers.insertSamplePersons(6, {
            age: [10, 20, 30, 40, 50, 60],
            firstName: ['John', 'Jane', 'Joe', 'Jim', 'Jill', 'Jack'],
          })

          const res = await database.table(personsTable).findMany({
            range: personsTable.age.range.between(20, 50),
            where: personsTable.firstName.inArray([
              'John',
              'Joe',
              'Jill',
              'Jack',
            ]),
          })

          expect(res.sort(byAge)).toEqual([
            expect.objectContaining({
              age: 30,
              firstName: 'Joe',
            }),
            expect.objectContaining({
              age: 50,
              firstName: 'Jill',
            }),
          ])
        })

        it('should sort by orderBy even if a range with a different column is provided', async () => {
          await helpers.insertSamplePersons(6, {
            firstName: ['Frank', 'Bob', 'Alice', 'Eve', 'David', 'Charlie'],
            age: [10, 20, 30, 40, 50, 60],
          })

          const res = await database.table(personsTable).findMany({
            orderBy: personsTable.firstName.asc(),
            range: personsTable.age.range.between(20, 40),
          })

          expect(res).toEqual([
            expect.objectContaining({
              firstName: 'Alice',
              age: 30,
            }),
            expect.objectContaining({
              firstName: 'Bob',
              age: 20,
            }),
            expect.objectContaining({
              firstName: 'Eve',
              age: 40,
            }),
          ])
        })

        it('should return all rows ordered by indexed column ascending', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findMany({
            orderBy: personsTable.firstName.asc(),
          })

          expect(res).toEqual(samplePersons.sort(byFirstName))
        })

        it('should return all rows ordered by indexed column descending', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findMany({
            orderBy: personsTable.firstName.desc(),
          })

          expect(res).toEqual(samplePersons.sort(byFirstName).reverse())
        })

        it('should return rows with filter ordered by indexed column', async () => {
          const samplePersons = await helpers.insertSamplePersons(6, {
            age: [10, 30, 40, 60],
          })

          const res = await database.table(personsTable).findMany({
            where: personsTable.age.greaterThanOrEquals(36),
            orderBy: personsTable.firstName.asc(),
          })

          expect(res).toEqual(
            samplePersons
              .filter(whereAgeGreaterThanOrEqual(36))
              .sort(byFirstName),
          )
        })

        it('should return rows ordered by indexed column with offset and filter', async () => {
          await helpers.insertSamplePersons(6, {
            age: [10, 20, 30, 40, 50, 60],
            firstName: ['John', 'Jane'],
          })

          const res = await database.table(personsTable).findMany({
            where: personsTable.firstName.equals('John'),
            orderBy: personsTable.age.asc(),
            offset: 2,
          })

          expect(res).toEqual([
            expect.objectContaining({
              age: 50,
              firstName: 'John',
            }),
          ])
        })

        it('should return all rows ordered by un-indexed column ascending', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findMany({
            orderBy: personsTable.lastName.asc(),
          })

          expect(res).toEqual(samplePersons.sort(byLastName))
        })

        it('should return all rows ordered by un-indexed column descending', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findMany({
            orderBy: personsTable.lastName.desc(),
          })

          expect(res).toEqual(samplePersons.sort(byLastName).reverse())
        })

        it('should return rows with filter ordered by un-indexed column', async () => {
          const samplePersons = await helpers.insertSamplePersons(6, {
            firstName: ['John', 'Jane'],
          })

          const res = await database.table(personsTable).findMany({
            where: personsTable.firstName.equals('John'),
            orderBy: personsTable.lastName.asc(),
          })

          expect(res).toEqual(
            samplePersons.filter(whereFirstNameEquals('John')).sort(byLastName),
          )
        })

        it('should return rows ordered by un-indexed column with offset and filter', async () => {
          await helpers.insertSamplePersons(6, {
            age: [10, 20, 30, 40, 50, 60],
            firstName: ['John', 'Jane', 'John', 'Jane', 'John', 'Jane'],
            lastName: ['F', 'E', 'D', 'C', 'B', 'A'],
          })

          // going from A to F, skip everyone that is not John, then skip the first John
          //  we are left with John D and John F

          const res = await database.table(personsTable).findMany({
            where: personsTable.firstName.equals('John'),
            orderBy: personsTable.lastName.asc(),
            offset: 1,
          })

          expect(res).toEqual([
            expect.objectContaining({
              age: 30,
              firstName: 'John',
              lastName: 'D',
            }),
            expect.objectContaining({
              age: 10,
              firstName: 'John',
              lastName: 'F',
            }),
          ])
        })

        it('should only return the first n entries in a table', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findMany({
            limit: 3,
            orderBy: personsTable.firstName.asc(),
          })

          expect(res).toEqual(samplePersons.sort(byFirstName).slice(0, 3))
        })

        it('should return all entries except the first n entries in a table', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findMany({
            offset: 3,
            orderBy: personsTable.firstName.asc(),
          })

          expect(res).toEqual(samplePersons.sort(byFirstName).slice(3))
        })

        it('should only return the first n after skipping the first m entries in a table', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findMany({
            offset: 2,
            limit: 2,
            orderBy: personsTable.firstName.asc(),
          })

          expect(res).toEqual(samplePersons.sort(byFirstName).slice(2, 4))
        })

        it('should return empty array when no entry is found', async () => {
          await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findMany({
            where: personsTable.id.equals(uuid()), // non-existent id
          })

          expect(res).toHaveLength(0)
        })
      })

      describe('update', () => {
        it('should update a single entry in a table', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)
          const randomPerson = randomElement(samplePersons, {
            safetyOffset: 1,
          })

          const newFirstName = faker.person.firstName()
          const newGender = faker.person.gender()

          const res = await database.table(personsTable).update({
            where: personsTable.id.equals(randomPerson.id),
            data: {
              firstName: newFirstName,
              gender: newGender,
            },
          })

          const personInDatabase = await helpers.getPersonInDatabaseById(
            randomPerson.id,
          )

          const expected: Person = {
            ...randomPerson,
            firstName: newFirstName,
            gender: newGender,
          }

          expect(res).toEqual([expected])
          expect(personInDatabase).toEqual(expected)
        })

        it('should update multiple entries in a table', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)
          const randomPersons = randomElements(samplePersons, 2, {
            safetyOffset: 1,
          })
          const ids = randomPersons.map((person) => person.id)

          const newLastName = faker.person.lastName()

          const res = await database.table(personsTable).update({
            where: personsTable.id.in(ids),
            data: {
              lastName: newLastName,
            },
          })

          const personsInDatabase = await helpers.getPersonsInDatabaseByIds(ids)

          const expected: Array<Person> = randomPersons.map((person) => ({
            ...person,
            lastName: newLastName,
          }))

          expect(res.sort(byId)).toEqual(expected.sort(byId))
          expect(personsInDatabase.sort(byId)).toEqual(expected.sort(byId))
        })

        it('should return empty array when updating an entry that does not exist', async () => {
          await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).update({
            where: personsTable.id.equals(uuid()), // non-existent id
            data: {
              firstName: 'Jeff',
            },
          })

          expect(res).toEqual(emptyArray())
        })

        it.todo('should fail when trying to update a primary key', async () => {
          // TBD

          const samplePersons = await helpers.insertSamplePersons(6)
          const randomPerson = randomElement(samplePersons, {
            safetyOffset: 1,
          })

          const newId = uuid()

          await expect(
            database.withTransaction(async (transaction) => {
              return await transaction.table(personsTable).update({
                where: personsTable.id.equals(randomPerson.id),
                data: {
                  id: newId,
                },
              })
            }),
          ).rejects.toThrowError(
            `Primary key cannot be changed. Tried to change columns: id.`,
          )
        })

        it.todo(
          'should fail when trying to change the value of a unique column to an existing value',
          async () => {
            const samplePersons = await helpers.insertSamplePersons(6)
            const [randomPerson, otherRandomPerson] = randomElements(
              samplePersons,
              2,
            )

            await expect(
              database.withTransaction(async (transaction) => {
                return await transaction.table(personsTable).update({
                  where: personsTable.id.equals(randomPerson.id),
                  data: {
                    username: otherRandomPerson.username,
                  },
                })
              }),
            ).rejects.toThrowError(
              `Unique constraint failed on column "username".`,
            )
          },
        )
      })

      describe('delete', () => {
        it('should delete a single entry in a table', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)
          const randomPerson = randomElement(samplePersons, {
            safetyOffset: 1,
          })

          await database.table(personsTable).delete({
            where: personsTable.id.equals(randomPerson.id),
          })

          const personsInDatabase = await helpers.getAllPersonsInDatabase()

          expect(personsInDatabase).not.toContain(randomPerson)
        })

        it('should delete multiple entries in a table', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)
          const randomPersons = randomElements(samplePersons, 2, {
            safetyOffset: 1,
          })
          const ids = randomPersons.map((person) => person.id)

          await database.table(personsTable).delete({
            where: personsTable.id.in(ids),
          })

          const personsInDatabase = await helpers.getAllPersonsInDatabase()

          expect(personsInDatabase).not.toContain(randomPersons)
        })
      })

      describe('deleteAll', () => {
        it('should delete all entries in a table', async () => {
          await helpers.insertSamplePersons(6)

          await database.table(personsTable).deleteAll()

          const personsInDatabase = await helpers.getAllPersonsInDatabase()

          expect(personsInDatabase).toHaveLength(0)
        })
      })
    })
  })
})
