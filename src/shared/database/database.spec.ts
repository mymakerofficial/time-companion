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

function byId(a: HasId, b: HasId) {
  return a.id.localeCompare(b.id)
}

function byFirstName(a: Person, b: Person) {
  return a.firstName.localeCompare(b.firstName)
}

function byAge(a: Person, b: Person) {
  return a.age - b.age
}

describe.each([
  ['IndexedDB', () => indexedDBAdapter(`test-database-${uuid()}`)],
  [
    'PGLite',
    (requirePersist: boolean) =>
      pgliteAdapter(
        `${requirePersist ? 'idb' : 'memory'}://test-database-${uuid()}`,
      ),
  ],
])('Adapter "%s"', (_, adapterFactory) => {
  describe.skip('unsafe', () => {
    describe('truncate', () => {
      it('should reset the database', async () => {
        const database = createDatabase(adapterFactory(false), {
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

        expect(await database.getTableNames()).toEqual(['test'])
        expect(database.version).toEqual(2)

        await database.unsafe.truncate()

        expect(await database.getTableNames()).toEqual([])
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
      const database = createDatabase(adapterFactory(false), {
        migrations: [],
      })

      database.unsafe.setMigrations([migration001, migration002])

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
      database = createDatabase(adapterFactory(false), {
        migrations: [],
      })

      await database.open()
    })

    afterEach(async () => {
      await database.unsafe.truncate()
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

    it.todo('should rollback the migration if an error occurs', async () => {
      const migrationAddValues = vi.fn(
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

      database.unsafe.setMigrations([migration001])
      await database.unsafe.migrate()

      expect(database.version).toBe(1)

      migration001.mockClear()

      database.unsafe.setMigrations([
        migration001,
        migrationAddValues,
        migrationWithError,
      ])

      await expect(database.unsafe.migrate()).rejects.toThrowError(
        'Error in migration',
      )

      expect(database.isOpen).toBe(true)
      expect(database.version).toBe(1)
      expect(migration001).not.toHaveBeenCalled()
      expect(migrationAddValues).toHaveBeenCalled()
      expect(migrationWithError).toHaveBeenCalled()

      expect(database.table('persons').findMany()).resolves.toEqual([])
      expect(database.table('pets').findMany()).rejects.toThrowError()
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
          expect(await database.getTableNames()).not.toContain('persons')

          await database.unsafe.runMigration(async (transaction) => {
            await transaction.createTable('persons', {
              id: c.uuid().primaryKey(),
              username: c.string(),
            })
          })

          expect(await database.getTableNames()).toContain('persons')
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

          expect(await database.getTableNames()).toContain('persons')

          await database.unsafe.runMigration(async (transaction) => {
            await transaction.dropTable('persons')
          })

          expect(await database.getTableNames()).not.toContain('persons')
        })
      })

      describe('alterTable', () => {
        describe('renameTo', () => {
          it.todo('should rename a table and retain its data', async () => {
            await database.unsafe.runMigration(async (transaction) => {
              await transaction.createTable('persons', {
                id: c.uuid().primaryKey(),
                username: c.string(),
              })
            })

            expect(await database.getTableNames()).toContain('persons')

            await database.table('persons').insert({
              data: {
                id: uuid(),
                username: 'johndoe',
              },
            })

            expect(database.table('persons').findFirst()).resolves.toEqual(
              expect.objectContaining({
                username: 'johndoe',
              }),
            )

            await database.unsafe.runMigration(async (transaction) => {
              await transaction.alterTable('persons', (table) => {
                table.renameTo('users')
              })
            })

            expect(await database.getTableNames()).toContain('users')

            expect(database.table('users').findFirst()).resolves.toEqual(
              expect.objectContaining({
                username: 'johndoe',
              }),
            )
          })
        })

        describe('addColumn', () => {
          it.todo('should add a column and fill it with a default value')
        })
        describe('renameColumn', () => {
          it.todo('should rename a column and retain its data')
        })
        describe('alterColumn', () => {
          it.todo('should change the data type of a column')
        })
        describe('dropColumn', () => {
          it.todo('should drop a column and its data')
        })
      })
    })
  })

  describe('queries', () => {
    const { database, helpers, personsTable, petsTable } = useDatabaseFixtures({
      database: createDatabase(adapterFactory(false), config),
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

        it.todo(
          'should fail when trying to insert an entry with a key that is not part of the schema',
          async () => {
            const samplePerson = helpers.samplePerson()
            const wrongPerson = {
              ...samplePerson,
              wrongKey: 'wrong value',
            }

            await expect(
              database.withTransaction(async (transaction) => {
                return await transaction.table(personsTable).insert({
                  data: wrongPerson,
                })
              }),
            ).rejects.toThrowError(
              `The key "wrongKey" is not part of the schema of table "persons".`,
            )
          },
        )

        it.todo(
          'should fail when trying to insert an entry with missing fields',
          async () => {
            const missingPerson = {
              id: uuid(),
            }

            await expect(
              database.withTransaction(async (transaction) => {
                return await transaction.table(personsTable).insert({
                  // @ts-expect-error
                  data: missingPerson,
                })
              }),
            ).rejects.toThrowError(
              `The key "firstName" is required but missing in the data.`,
            )
          },
        )

        it.todo(
          'should fail when trying to insert a value that already exists on a unique column',
          async () => {
            const samplePersons = await helpers.insertSamplePersons(6)
            const randomPerson = randomElement(samplePersons)

            const newPersonWithSameUsername = helpers.samplePerson({
              username: randomPerson.username,
            })

            await expect(
              database.withTransaction(async (transaction) => {
                return await transaction.table(personsTable).insert({
                  data: newPersonWithSameUsername,
                })
              }),
            ).rejects.toThrowError(
              `Unique constraint failed on column "username".`,
            )
          },
        )
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

        it('should find all entries in a table ordered by indexed key ascending', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findMany({
            orderBy: personsTable.firstName.asc(),
          })

          expect(res).toEqual(samplePersons.sort(byFirstName))
        })

        it('should find all entries in a table ordered by indexed key descending', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)

          const res = await database.table(personsTable).findMany({
            orderBy: personsTable.firstName.desc(),
          })

          expect(res).toEqual(samplePersons.sort(byFirstName).reverse())
        })

        it.todo('should fail when ordering by un-indexed key', async () => {
          await helpers.insertSamplePersons(6)

          expect(
            database.table(personsTable).findMany({
              orderBy: personsTable.lastName.asc(),
            }),
          ).rejects.toThrowError(
            'Failed to order by column "lastName". Column must either be indexed or the primary key.',
          )
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
