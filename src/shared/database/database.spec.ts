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
import { asArray, firstOf, lastOf } from '@shared/lib/utils/list'
import { randomElement, randomElements } from '@shared/lib/utils/random'
import type { UpgradeFunction } from '@shared/database/types/database'
import { useDatabaseFixtures } from '@test/fixtures/database/databaseFixtures'
import type { Person } from '@test/fixtures/database/types'
import type { HasId } from '@shared/model/helpers/hasId'
import { uuid } from '@shared/lib/utils/uuid'
import { createDatabase } from '@shared/database/factory/database'
import { asyncNoop } from '@shared/lib/utils/noop'
import fakeIndexedDB from 'fake-indexeddb'
import { indexedDBAdapter } from '@shared/database/adapters/indexedDB/database'
import { pgliteAdapter } from '@shared/database/adapters/pglite/database'

function byId(a: HasId, b: HasId) {
  return a.id.localeCompare(b.id)
}

function byFirstName(a: Person, b: Person) {
  return a.firstName.localeCompare(b.firstName)
}

describe.each([
  ['IndexedDB', () => createDatabase(indexedDBAdapter(fakeIndexedDB))],
  ['PGLite', () => createDatabase(pgliteAdapter())],
])('Adapter "%s"', (_, databaseFactory) => {
  const { database, helpers, personsTable, petsTable } = useDatabaseFixtures({
    database: databaseFactory(),
  })

  afterAll(async () => {
    await helpers.cleanup()
  })

  describe('getTableNames', async () => {
    afterEach(async () => {
      await helpers.cleanup()
    })

    it('should return all table names', async () => {
      await helpers.openDatabaseAndMigrateIfNecessary()

      const tableNames = await database.getTableNames()

      expect(tableNames).toEqual(['persons', 'pets'])
    })
  })

  describe.todo('open', () => {
    afterEach(async () => {
      await helpers.cleanup()
    })

    it.todo(
      'should call the upgrade function with when opening for the first time',
      async () => {
        const upgradeFn: UpgradeFunction = vi.fn(asyncNoop)

        await database.open(helpers.databaseName, 1, upgradeFn)

        expect(upgradeFn).toHaveBeenCalledWith(expect.anything(), 1, 0)
      },
    )

    it.todo(
      'should fail when trying to open a database with a lower version than the current one',
      async () => {
        await database.open(helpers.databaseName, 2, asyncNoop)

        await database.close()

        await expect(
          database.open(helpers.databaseName, 1, asyncNoop),
        ).rejects.toThrowError(
          `Cannot open database at lower version. Current version is "2", requested version is "1".`,
        )
      },
    )

    it.todo(
      'should call the upgrade function incrementing the version',
      async () => {
        await helpers.ensureDatabaseExistsAtVersion(1)

        const upgradeFn: UpgradeFunction = vi.fn(asyncNoop)

        await database.open(helpers.databaseName, 4, upgradeFn)

        expect(upgradeFn).toHaveBeenNthCalledWith(1, expect.anything(), 2, 1)
        expect(upgradeFn).toHaveBeenNthCalledWith(2, expect.anything(), 3, 2)
        expect(upgradeFn).toHaveBeenNthCalledWith(3, expect.anything(), 4, 3)
      },
    )
  })

  describe('close', () => {
    afterEach(async () => {
      await helpers.cleanup()
    })

    it('should close the database', async () => {
      await helpers.openDatabaseAndCreateTablesAtVersion(1)

      expect(async () => database.getTableNames()).not.toThrowError()

      await database.close()

      expect(async () => database.getTableNames()).rejects.toThrowError()
    })
  })

  describe('table', () => {
    beforeAll(async () => {
      await helpers.cleanup()
      await helpers.openDatabaseAndMigrateIfNecessary()
    })

    afterEach(async () => {
      await helpers.clearDatabase()
    })

    describe('insert', () => {
      it('should insert data', async () => {
        const samplePerson = helpers.samplePerson()

        const res = await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).insert({
              data: samplePerson,
            })
          },
        )

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
            database.withWriteTransaction(
              [personsTable],
              async (transaction) => {
                return await transaction.table(personsTable).insert({
                  data: wrongPerson,
                })
              },
            ),
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
            database.withWriteTransaction(
              [personsTable],
              async (transaction) => {
                return await transaction.table(personsTable).insert({
                  // @ts-expect-error
                  data: missingPerson,
                })
              },
            ),
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
            database.withWriteTransaction(
              [personsTable],
              async (transaction) => {
                return await transaction.table(personsTable).insert({
                  data: newPersonWithSameUsername,
                })
              },
            ),
          ).rejects.toThrowError(
            `Unique constraint failed on column "username".`,
          )
        },
      )
    })

    describe('insertMany', () => {
      it('should insert data', async () => {
        const samplePersons = helpers.samplePersons(3)

        const res = await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).insertMany({
              data: samplePersons,
            })
          },
        )

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        expect(res.sort(byId)).toEqual(samplePersons.sort(byId))
        expect(personsInDatabase.sort(byId)).toEqual(samplePersons.sort(byId))
      })
    })

    describe('findFirst', () => {
      it('should return a value that was inserted', async () => {
        const samplePersons = await helpers.insertSamplePersons(3)

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findFirst()
          },
        )

        expect(samplePersons).toContainEqual(res)
      })

      it('should find unique entry in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPerson = randomElement(samplePersons, {
          safetyOffset: 1,
        })

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findFirst({
              where: personsTable.id.equals(randomPerson.id),
            })
          },
        )

        expect(res).toEqual(randomPerson)
      })

      it('should return first entry sorted on primary key by default', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findFirst()
          },
        )

        expect(res).toEqual(firstOf(samplePersons.sort(byId)))
      })

      it('should find a single entry in a table with order ascending', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findFirst({
              orderBy: personsTable.firstName.asc(),
            })
          },
        )

        expect(res).toEqual(firstOf(samplePersons.sort(byFirstName)))
      })

      it('should find the first entry in a table sorted descending', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findFirst({
              orderBy: personsTable.firstName.desc(),
            })
          },
        )

        expect(res).toEqual(lastOf(samplePersons.sort(byFirstName)))
      })

      it('should find a single entity in a table with using and filters', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPerson = randomElement(samplePersons, {
          safetyOffset: 1,
        })

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findFirst({
              where: personsTable.firstName
                .equals(randomPerson.firstName)
                .and(personsTable.age.equals(randomPerson.age))
                .and(personsTable.id.notEquals('not-an-id')),
            })
          },
        )

        expect(res).toEqual(randomPerson)
      })

      it('should return null when no entry is found', async () => {
        await helpers.insertSamplePersons(6)

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findFirst({
              where: personsTable.id.equals('non-existent-id'),
            })
          },
        )

        expect(res).toBeNull()
      })
    })

    describe('findMany', () => {
      it('should find all entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findMany()
          },
        )

        expect(res.sort(byId)).toEqual(samplePersons.sort(byId))
      })

      it('should find all entries in a table with a filter', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPerson = randomElement(samplePersons, {
          safetyOffset: 1,
        })

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findMany({
              where: personsTable.firstName.equals(randomPerson.firstName),
            })
          },
        )

        expect(res.sort(byId)).toEqual(
          samplePersons
            .filter((person) => person.firstName === randomPerson.firstName)
            .sort(byId),
        )
      })

      it('should return values sorted on primary key by default', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findMany()
          },
        )

        expect(res).toEqual(samplePersons.sort(byId))
      })

      it('should find all entries in a table ordered by indexed key ascending', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findMany({
              orderBy: personsTable.firstName.asc(),
            })
          },
        )

        expect(res).toEqual(samplePersons.sort(byFirstName))
      })

      it('should find all entries in a table ordered by indexed key descending', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findMany({
              orderBy: personsTable.firstName.desc(),
            })
          },
        )

        expect(res).toEqual(samplePersons.sort(byFirstName).reverse())
      })

      it('should fail when ordering by un-indexed key', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        expect(async () => {
          await database.withReadTransaction(
            [personsTable],
            async (transaction) => {
              return await transaction.table(personsTable).findMany({
                orderBy: personsTable.lastName.asc(),
              })
            },
          )
        }).rejects.toThrow(
          'The index "lastName" does not exist. You can only order by existing indexes or primary key.',
        )
      })

      it('should only return the first n entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findMany({
              limit: 3,
            })
          },
        )

        expect(res).toEqual(samplePersons.sort(byId).slice(0, 3))
      })

      it('should return all entries except the first n entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findMany({
              offset: 3,
            })
          },
        )

        expect(res).toEqual(samplePersons.sort(byId).slice(3))
      })

      it('should only return the first n after skipping the first m entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findMany({
              offset: 2,
              limit: 2,
            })
          },
        )

        expect(res).toEqual(samplePersons.sort(byId).slice(2, 4))
      })

      it('should return empty array when no entry is found', async () => {
        await helpers.insertSamplePersons(6)

        const res = await database.withReadTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).findMany({
              where: personsTable.id.equals('non-existent-id'),
            })
          },
        )

        expect(res).toHaveLength(0)
      })
    })

    describe('leftJoin', () => {
      it('should find an entity by joined entity id', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const samplePets = await helpers.insertSamplePets(3, 1)

        const randomPet = randomElement(samplePets, {
          safetyOffset: 1,
        })

        const petId = randomPet.id

        // find the owner of the pet with the random id
        const owner = await database.withReadTransaction(
          [personsTable, petsTable],
          async (transaction) => {
            return await transaction
              .table(personsTable)
              .leftJoin(petsTable, {
                on: { id: 'ownerId' },
                where: petsTable.id.equals(petId),
              })
              .findFirst()
          },
        )

        const expectedOwner = samplePersons.find(
          (person) => person.id === randomPet.ownerId,
        )

        expect(owner).toEqual(expectedOwner)
      })

      it('should delete an entity by joined entity id', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const samplePets = await helpers.insertSamplePets(3, 1)

        const randomPet = randomElement(samplePets, {
          safetyOffset: 1,
        })

        const petId = randomPet.id

        // delete the owner of the pet with the random id
        await database.withWriteTransaction(
          [personsTable, petsTable],
          async (transaction) => {
            return await transaction
              .table(personsTable)
              .leftJoin(petsTable, {
                on: { id: 'ownerId' },
                where: petsTable.id.equals(petId),
              })
              .deleteAll()
          },
        )

        const owner = samplePersons.find(
          (person) => person.id === randomPet.ownerId,
        )!

        const expectedPersons = samplePersons
          .filter((person) => person.id !== owner.id)
          .sort(byId)

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        expect(personsInDatabase).toEqual(expectedPersons)
      })

      it.todo(
        'should fail when trying to join on incompatible keys',
        async () => {
          await helpers.insertSamplePersons(6)
          const samplePets = await helpers.insertSamplePets(3, 1)

          const randomPet = randomElement(samplePets, {
            safetyOffset: 1,
          })

          expect(async () => {
            await database.withReadTransaction(
              [personsTable],
              async (transaction) => {
                return await transaction
                  .table(personsTable)
                  .leftJoin(petsTable, {
                    on: { id: 'age' },
                    where: petsTable.id.equals(randomPet.id),
                  })
                  .findMany()
              },
            )
          }).rejects.toThrowError(`The keys "id" and "age" are not compatible.`)
        },
      )
    })

    describe('update', () => {
      it('should update a single entry in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPerson = randomElement(samplePersons, {
          safetyOffset: 1,
        })

        const newFirstName = faker.person.firstName()
        const newGender = faker.person.gender()

        const res = await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).update({
              where: personsTable.id.equals(randomPerson.id),
              data: {
                firstName: newFirstName,
                gender: newGender,
              },
            })
          },
        )

        const personInDatabase = await helpers.getPersonInDatabaseById(
          randomPerson.id,
        )

        const expected: Person = {
          ...randomPerson,
          firstName: newFirstName,
          gender: newGender,
        }

        expect(res).toEqual(expected)
        expect(personInDatabase).toEqual(expected)
      })

      it('should return null when updating an entry that does not exist', async () => {
        await helpers.insertSamplePersons(6)

        const res = await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).update({
              where: personsTable.id.equals('non-existent-id'),
              data: {
                firstName: 'Jeff',
              },
            })
          },
        )

        expect(res).toBeNull()
      })

      it('should fail when trying to update a primary key', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPerson = randomElement(samplePersons, {
          safetyOffset: 1,
        })

        const newId = uuid()

        await expect(
          database.withWriteTransaction([personsTable], async (transaction) => {
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
            database.withWriteTransaction(
              [personsTable],
              async (transaction) => {
                return await transaction.table(personsTable).update({
                  where: personsTable.id.equals(randomPerson.id),
                  data: {
                    username: otherRandomPerson.username,
                  },
                })
              },
            ),
          ).rejects.toThrowError(
            `Unique constraint failed on column "username".`,
          )
        },
      )
    })

    describe('updateMany', () => {
      it('should update multiple entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPersons = randomElements(samplePersons, 2, {
          safetyOffset: 1,
        })
        const ids = randomPersons.map((person) => person.id)

        const newLastName = faker.person.lastName()

        const res = await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).updateMany({
              where: personsTable.id.in(ids),
              data: {
                lastName: newLastName,
              },
            })
          },
        )

        const personsInDatabase = await helpers.getPersonsInDatabaseByIds(ids)

        const expected: Array<Person> = randomPersons.map((person) => ({
          ...person,
          lastName: newLastName,
        }))

        expect(res.sort(byId)).toEqual(expected.sort(byId))
        expect(personsInDatabase.sort(byId)).toEqual(expected.sort(byId))
      })

      it('should return the updated entities sorted by primary key', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPersons = randomElements(samplePersons, 2, {
          safetyOffset: 1,
        })

        const newLastName = faker.person.lastName()

        const res = await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).updateMany({
              where: personsTable.id.in(
                randomPersons.map((person) => person.id),
              ),
              data: {
                lastName: newLastName,
              },
            })
          },
        )

        const expected: Array<Person> = randomPersons
          .map((person) => ({
            ...person,
            lastName: newLastName,
          }))
          .sort(byId)

        expect(res).toEqual(expected)
      })

      it('should only update the first n entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            await transaction.table(personsTable).updateMany({
              data: { firstName: 'Jeff' },
              limit: 3,
            })
          },
        )

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        const expected = samplePersons.sort(byId).map((person, index) => ({
          ...person,
          firstName: index < 3 ? 'Jeff' : person.firstName,
        }))

        expect(personsInDatabase).toEqual(expected)
      })

      it('should update all entries except the first n entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            await transaction.table(personsTable).updateMany({
              data: { firstName: 'Jeff' },
              offset: 3,
            })
          },
        )

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        const expected = samplePersons.sort(byId).map((person, index) => ({
          ...person,
          firstName: index < 3 ? person.firstName : 'Jeff',
        }))

        expect(personsInDatabase).toEqual(expected)
      })

      it('should only update the first n after skipping the first m entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(12)

        await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            await transaction.table(personsTable).updateMany({
              data: { firstName: 'Jeff' },
              offset: 3,
              limit: 5,
            })
          },
        )

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        const expected = samplePersons.sort(byId).map((person, index) => ({
          ...person,
          firstName: index >= 3 && index < 8 ? 'Jeff' : person.firstName,
        }))

        expect(personsInDatabase).toEqual(expected)
      })

      it('should return empty array when no entry is found', async () => {
        await helpers.insertSamplePersons(6)

        const res = await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            return await transaction.table(personsTable).updateMany({
              data: { firstName: 'Jeff' },
              where: personsTable.id.equals('non-existent-id'),
            })
          },
        )

        expect(res).toHaveLength(0)
      })
    })

    describe('delete', () => {
      it('should delete a single entry in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPerson = randomElement(samplePersons, {
          safetyOffset: 1,
        })

        await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            await transaction
              .table(personsTable)
              .delete({ where: personsTable.id.equals(randomPerson.id) })
          },
        )

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        expect(personsInDatabase).not.toContain(randomPerson)
      })
    })

    describe('deleteMany', () => {
      it('should delete multiple entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPersons = randomElements(samplePersons, 2, {
          safetyOffset: 1,
        })
        const ids = randomPersons.map((person) => person.id)

        await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            await transaction
              .table(personsTable)
              .deleteMany({ where: personsTable.id.in(ids) })
          },
        )

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        expect(personsInDatabase).not.toContain(randomPersons)
      })

      it('should only delete the first n entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            await transaction.table(personsTable).deleteMany({ limit: 3 })
          },
        )

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        expect(personsInDatabase).toEqual(samplePersons.sort(byId).slice(3))
      })

      it('should delete all entries except the first n entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            await transaction.table(personsTable).deleteMany({ offset: 3 })
          },
        )

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        expect(personsInDatabase).toEqual(samplePersons.sort(byId).slice(0, 3))
      })

      it('should only delete the first n after skipping the first m entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(12)

        await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            await transaction
              .table(personsTable)
              .deleteMany({ offset: 3, limit: 5 })
          },
        )

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        const expectedDeleted = samplePersons.sort(byId).slice(3, 8)

        expect(personsInDatabase).toEqual(
          samplePersons
            .sort(byId)
            .filter((person) => !expectedDeleted.includes(person)),
        )
      })
    })

    describe('deleteAll', () => {
      it('should delete all entries in a table', async () => {
        await helpers.insertSamplePersons(6)

        await database.withWriteTransaction(
          [personsTable],
          async (transaction) => {
            await transaction.table(personsTable).deleteAll()
          },
        )

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        expect(personsInDatabase).toHaveLength(0)
      })
    })
  })
})
