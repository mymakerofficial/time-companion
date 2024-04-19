import { afterEach, describe, expect, it, vi } from 'vitest'
import { createInMemoryDatabase } from '@shared/database/adapters/inMemory/inMemoryDatabase'
import { faker } from '@faker-js/faker'
import { asArray, firstOf, lastOf } from '@shared/lib/utils/list'
import { randomElement, randomElements } from '@shared/lib/utils/random'
import type {
  UpgradeFunction,
  UpgradeTransaction,
} from '@shared/database/database'
import { createIndexedDbAdapter } from '@shared/database/adapters/indexedDb/indexedDb'
import { indexedDB as fakeIndexedDB } from 'fake-indexeddb'
import { useDatabaseFixtures } from '@test/fixtures/database/databaseFixtures'
import type { Person, Pet } from '@test/fixtures/database/types'
import type { HasId } from '@shared/model/helpers/hasId'
import { uuid } from '@shared/lib/utils/uuid'

function byId(a: HasId, b: HasId) {
  return a.id.localeCompare(b.id)
}

function byFirstName(a: Person, b: Person) {
  return a.firstName.localeCompare(b.firstName)
}

function byLastName(a: Person, b: Person) {
  return a.lastName.localeCompare(b.lastName)
}

describe.each([
  ['In memory database', createInMemoryDatabase, []],
  ['IndexedDB Adapter', createIndexedDbAdapter, [fakeIndexedDB]],
])('%s', (_, createDatabase, args) => {
  const { database, helpers } = useDatabaseFixtures(createDatabase(...args))

  describe('upgrade', () => {
    describe('createTable', () => {
      it('should create a table', async () => {
        const upgradeFn: UpgradeFunction = vi.fn(
          async (transaction: UpgradeTransaction) => {
            const personsTable = await transaction.createTable({
              name: helpers.personsTableName,
              schema: {
                id: 'string',
                firstName: 'string',
                lastName: 'string',
                username: 'string',
                gender: 'string',
                age: 'number',
              },
              primaryKey: 'id',
            })

            await personsTable.createIndex({
              keyPath: 'firstName',
              unique: false,
            })

            await personsTable.createIndex({
              keyPath: 'username',
              unique: true,
            })

            await personsTable.createIndex({
              keyPath: 'age',
              unique: false,
            })

            const petsTable = await transaction.createTable({
              name: helpers.petsTableName,
              schema: {
                id: 'string',
                name: 'string',
                age: 'number',
                ownerId: 'string',
              },
              primaryKey: 'id',
            })

            await petsTable.createIndex({
              keyPath: 'name',
              unique: true,
            })
          },
        )

        await database.open(helpers.databaseName, 1, upgradeFn)

        const tableNames = await database.getTableNames()
        const personsIndexes = await database.getIndexes('persons')
        const petsIndexes = await database.getIndexes('pets')

        expect(upgradeFn).toHaveBeenCalled()

        expect(tableNames.sort()).toEqual(['persons', 'pets'])
        expect(personsIndexes).toEqual(['age', 'firstName', 'username'])
        expect(petsIndexes).toEqual(['name'])
      })
    })
  })

  describe('table', () => {
    afterEach(async () => {
      await helpers.clearDatabase()
    })

    it('should throw when trying to access a non-existing table', async () => {
      expect(
        database.withTransaction(async (transaction) => {
          transaction.table('non-existing-table')
        }),
      ).rejects.toThrowError(`Table "non-existing-table" does not exist.`)
    })

    describe('insert', () => {
      it('should insert data', async () => {
        const samplePerson = helpers.samplePerson()

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .insert({
              data: samplePerson,
            })
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
              return await transaction
                .table<Person>(helpers.personsTableName)
                .insert({
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
              return await transaction
                .table<Person>(helpers.personsTableName)
                .insert({
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
              return await transaction
                .table<Person>(helpers.personsTableName)
                .insert({
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

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .insertMany({
              data: samplePersons,
            })
        })

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        expect(res.sort(byId)).toEqual(samplePersons.sort(byId))
        expect(personsInDatabase.sort(byId)).toEqual(samplePersons.sort(byId))
      })
    })

    describe('findFirst', () => {
      it('should return a value that was inserted', async () => {
        const samplePersons = await helpers.insertSamplePersons(3)

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .findFirst()
        })

        expect(samplePersons).toContainEqual(res)
      })

      it('should find unique entry in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPerson = randomElement(samplePersons, {
          safetyOffset: 1,
        })

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .findFirst({
              where: {
                id: { equals: randomPerson.id },
              },
            })
        })

        expect(res).toEqual(randomPerson)
      })

      it('should return first entry sorted on primary key by default', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .findFirst()
        })

        expect(res).toEqual(firstOf(samplePersons.sort(byId)))
      })

      it('should find a single entry in a table with order ascending', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .findFirst({
              orderBy: { firstName: 'asc' },
            })
        })

        expect(res).toEqual(firstOf(samplePersons.sort(byFirstName)))
      })

      it('should find the first entry in a table sorted descending', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .findFirst({
              orderBy: { firstName: 'desc' },
            })
        })

        expect(res).toEqual(lastOf(samplePersons.sort(byFirstName)))
      })

      it('should find a single entity in a table with using AND filters', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPerson = randomElement(samplePersons, {
          safetyOffset: 1,
        })

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .findFirst({
              where: {
                AND: [
                  { firstName: { equals: randomPerson.firstName } },
                  {
                    AND: [
                      { age: { equals: randomPerson.age } },
                      { id: { notEquals: 'not-an-id' } },
                    ],
                  },
                ],
              },
            })
        })

        expect(res).toEqual(randomPerson)
      })
    })

    describe('findMany', () => {
      it('should find all entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .findMany()
        })

        expect(res.sort(byId)).toEqual(samplePersons.sort(byId))
      })

      it('should find all entries in a table with a filter', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPerson = randomElement(samplePersons, {
          safetyOffset: 1,
        })

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .findMany({
              where: { firstName: { equals: randomPerson.firstName } },
            })
        })

        expect(res.sort(byId)).toEqual(
          samplePersons
            .filter((person) => person.firstName === randomPerson.firstName)
            .sort(byId),
        )
      })

      it('should return values sorted on primary key by default', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .findMany()
        })

        expect(res).toEqual(samplePersons.sort(byId))
      })

      it('should find all entries in a table ordered by indexed key ascending', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .findMany({
              orderBy: { firstName: 'asc' },
            })
        })

        expect(res).toEqual(samplePersons.sort(byFirstName))
      })

      it('should find all entries in a table ordered by indexed key descending', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .findMany({
              orderBy: { firstName: 'desc' },
            })
        })

        expect(res).toEqual(samplePersons.sort(byFirstName).reverse())
      })

      it('should find all entries in a table ordered by un-indexed key ascending', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .findMany({
              orderBy: { lastName: 'asc' },
            })
        })

        expect(res).toEqual(samplePersons.sort(byLastName))
      })

      it('should find all entries in a table ordered by un-indexed key descending', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .findMany({
              orderBy: { lastName: 'desc' },
            })
        })

        expect(res).toEqual(samplePersons.sort(byLastName).reverse())
      })
    })

    describe('join', () => {
      describe('left', () => {
        it('should find a entity by joined entity id', async () => {
          const samplePersons = await helpers.insertSamplePersons(6)
          const samplePets = await helpers.insertSamplePets(3, 1)

          const randomPet = randomElement(samplePets, {
            safetyOffset: 1,
          })

          const res = await database.withTransaction(async (transaction) => {
            return await transaction
              .join<Person, Pet>(
                helpers.personsTableName,
                helpers.petsTableName,
              )
              .left({
                on: { id: 'ownerId' },
                where: { id: { equals: randomPet.id } },
              })
              .findMany()
          })

          const expected = samplePersons.filter(
            (person) => person.id === randomPet.ownerId,
          )

          expect(res.sort(byId)).toEqual(expected.sort(byId))
        })
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

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .update({
              where: { id: { equals: randomPerson.id } },
              data: {
                firstName: newFirstName,
                gender: newGender,
              },
            })
        })

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
              return await transaction
                .table<Person>(helpers.personsTableName)
                .update({
                  where: { id: { equals: randomPerson.id } },
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

    describe('updateMany', () => {
      it('should update multiple entries in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPersons = randomElements(samplePersons, 2, {
          safetyOffset: 1,
        })
        const ids = randomPersons.map((person) => person.id)

        const newLastName = faker.person.lastName()

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .updateMany({
              where: { id: { in: ids } },
              data: {
                lastName: newLastName,
              },
            })
        })

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

        const res = await database.withTransaction(async (transaction) => {
          return await transaction
            .table<Person>(helpers.personsTableName)
            .updateMany({
              where: { id: { in: randomPersons.map((person) => person.id) } },
              data: {
                lastName: newLastName,
              },
            })
        })

        const expected: Array<Person> = randomPersons
          .map((person) => ({
            ...person,
            lastName: newLastName,
          }))
          .sort(byId)

        expect(res).toEqual(expected)
      })
    })

    describe('delete', () => {
      it('should delete a single entry in a table', async () => {
        const samplePersons = await helpers.insertSamplePersons(6)
        const randomPerson = randomElement(samplePersons, {
          safetyOffset: 1,
        })

        await database.withTransaction(async (transaction) => {
          await transaction
            .table<Person>(helpers.personsTableName)
            .delete({ where: { id: { equals: randomPerson.id } } })
        })

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

        await database.withTransaction(async (transaction) => {
          await transaction
            .table<Person>(helpers.personsTableName)
            .deleteMany({ where: { id: { in: ids } } })
        })

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        expect(personsInDatabase).not.toContain(randomPersons)
      })
    })

    describe('deleteAll', () => {
      it('should delete all entries in a table', async () => {
        await helpers.insertSamplePersons(6)

        await database.withTransaction(async (transaction) => {
          await transaction.table<Person>(helpers.personsTableName).deleteAll()
        })

        const personsInDatabase = await helpers.getAllPersonsInDatabase()

        expect(personsInDatabase).toHaveLength(0)
      })
    })
  })
})
