import { describe, expect, it, vi } from 'vitest'
import { createInMemoryDatabase } from '@shared/database/adapters/inMemory/inMemoryDatabase'
import { uuid } from '@shared/lib/utils/uuid'
import { faker } from '@faker-js/faker'
import { excludeFirst, firstOf } from '@shared/lib/utils/list'
import { randomElement, randomElements } from '@shared/lib/utils/random'
import type {
  UpgradeFunction,
  UpgradeTransaction,
} from '@shared/database/database'
import { createIndexedDbAdapter } from '@shared/database/adapters/indexedDb/indexedDb'
import { DatabaseTestFixture } from '@shared/database/tests/fixture'
import { indexedDB } from 'fake-indexeddb'

interface User {
  id: string
  name: string
  number: number
}

interface Project {
  id: string
  name: string
  color: string
  userId: string
}

describe.sequential.each([
  ['In memory database', createInMemoryDatabase, []],
  ['IndexedDB Adapter', createIndexedDbAdapter, [indexedDB]],
])('%s', (_, createDatabase, args) => {
  const fixture = new DatabaseTestFixture(createDatabase(...args))
  const database = fixture.database

  const usersLength = 7
  const projectsPerUserLength = 6

  function randomUser(index: number = 0): User {
    return {
      id: uuid(),
      name: faker.person.fullName(),
      number: faker.number.int() - index,
    }
  }

  function randomProject(userId: string): Project {
    return {
      id: uuid(),
      name: faker.commerce.productName(),
      color: faker.color.human(),
      userId,
    }
  }

  const users: Array<User> = Array.from({ length: usersLength }, (_, index) =>
    randomUser(index),
  )

  const projects: Array<Project> = users.flatMap((user) =>
    Array.from({ length: projectsPerUserLength }, () => randomProject(user.id)),
  )

  describe('createTable', () => {
    it('should create a table', async () => {
      const upgradeFn: UpgradeFunction = vi.fn(
        async (transaction: UpgradeTransaction) => {
          const usersTable = await transaction.createTable({
            name: 'users',
            schema: { id: 'string', name: 'string', number: 'number' },
            primaryKey: 'id',
          })

          await usersTable.createIndex({
            keyPath: 'name',
            unique: true,
          })

          await usersTable.createIndex({
            keyPath: 'number',
            unique: false,
          })

          const projectsTable = await transaction.createTable({
            name: 'projects',
            schema: {
              id: 'string',
              name: 'string',
              color: 'string',
              userId: 'string',
            },
            primaryKey: 'id',
          })

          await projectsTable.createIndex({
            keyPath: 'name',
            unique: true,
          })
        },
      )

      await database.open(fixture.getDatabaseName(), 1, upgradeFn)

      const tableNames = await database.getTableNames()
      const usersIndexes = await database.getIndexes('users')
      const projectsIndexes = await database.getIndexes('projects')

      expect(upgradeFn).toHaveBeenCalled()

      expect(tableNames.sort()).toEqual(['projects', 'users'])
      expect(usersIndexes).toEqual(['name', 'number'])
      expect(projectsIndexes).toEqual(['name'])
    })
  })

  describe('table', () => {
    it('should throw an error when trying to access a non-existing table', async () => {
      await database.withTransaction(async (transaction) => {
        expect(() => transaction.table('non-existing-table')).toThrowError(
          `Table "non-existing-table" does not exist.`,
        )
      })
    })
  })

  describe('insert', () => {
    it('should insert data', async () => {
      const createdUser = await database.withTransaction(
        async (transaction) => {
          return await transaction.table<User>('users').insert({
            data: firstOf(users),
          })
        },
      )

      expect(createdUser).toEqual(firstOf(users))
    })
  })

  describe('insertMany', () => {
    it('should insert data', async () => {
      const { createdUsers, createdProjects } = await database.withTransaction(
        async (transaction) => {
          const createdUsers = await transaction
            .table<User>('users')
            .insertMany({
              data: excludeFirst(users), // exclude the first user as it was already inserted
            })

          const createdProjects = await transaction
            .table<Project>('projects')
            .insertMany({
              data: projects,
            })

          return { createdUsers, createdProjects }
        },
      )

      expect(createdUsers).toEqual(excludeFirst(users))
      expect(createdProjects).toEqual(projects)
    })
  })

  describe('findFirst', () => {
    it('should return a value that was inserted', async () => {
      const resUser = await database.withTransaction(async (transaction) =>
        transaction.table<User>('users').findFirst(),
      )

      expect(users).toContainEqual(resUser)
    })

    it('should find unique entry in a table', async () => {
      const randomUser = randomElement(users, {
        safetyOffset: 1,
      })

      const resUser = await database.withTransaction(async (transaction) =>
        transaction.table<User>('users').findFirst({
          where: {
            id: { equals: randomUser.id },
          },
        }),
      )

      expect(resUser).toEqual(randomUser)
    })

    it('should throw an error when trying to order by non-indexed column', async () => {
      expect(
        async () =>
          await database.withTransaction(async (transaction) =>
            transaction.table<Project>('projects').findFirst({
              orderBy: { color: 'desc' },
            }),
          ),
      ).rejects.toThrowError(
        `Column "color" is not indexed. You can only order by indexed columns.`,
      )
    })

    it('should find a single entry in a table with order ascending', async () => {
      const resUser = await database.withTransaction(async (transaction) =>
        transaction.table<User>('users').findFirst({
          orderBy: { number: 'asc' },
        }),
      )

      expect(resUser).toEqual(
        firstOf([...users].sort((a, b) => a.number - b.number)),
      )
    })

    it('should find the first entry in a table sorted descending', async () => {
      const resUser = await database.withTransaction(async (transaction) =>
        transaction.table<User>('users').findFirst({
          orderBy: { number: 'desc' },
        }),
      )

      expect(resUser).toEqual(
        firstOf([...users].sort((a, b) => b.number - a.number)),
      )
    })

    it('should find a single entity in a table with using AND filters', async () => {
      const randomProject = randomElement(projects, {
        safetyOffset: projectsPerUserLength,
      })

      const resProjects = await database.withTransaction(async (transaction) =>
        transaction.table<Project>('projects').findFirst({
          where: {
            AND: [
              { color: { equals: randomProject.color } },
              {
                AND: [
                  { name: { equals: randomProject.name } },
                  { id: { notEquals: 'not-an-id' } },
                ],
              },
            ],
          },
        }),
      )

      expect(resProjects).toEqual(randomProject)
    })
  })

  describe('findMany', () => {
    it('should find all entries in a table', async () => {
      const resProjects = await database.withTransaction(async (transaction) =>
        transaction.table<Project>('projects').findMany(),
      )

      expect([...resProjects].sort((a, b) => a.id.localeCompare(b.id))).toEqual(
        [...projects].sort((a, b) => a.id.localeCompare(b.id)),
      )
    })

    it('should find all entries in a table with a filter', async () => {
      const randomProject = randomElement(projects, {
        safetyOffset: projectsPerUserLength,
      })

      const resProjects = await database.withTransaction(async (transaction) =>
        transaction.table<Project>('projects').findMany({
          where: { color: { equals: randomProject.color } },
        }),
      )

      expect([...resProjects].sort((a, b) => a.id.localeCompare(b.id))).toEqual(
        [...projects]
          .filter((project) => project.color === randomProject.color)
          .sort((a, b) => a.id.localeCompare(b.id)),
      )
    })

    it('should throw an error when trying to order by non-indexed column', async () => {
      expect(
        async () =>
          await database.withTransaction(async (transaction) =>
            transaction.table<Project>('projects').findMany({
              orderBy: { color: 'desc' },
            }),
          ),
      ).rejects.toThrowError(
        `Column "color" is not indexed. You can only order by indexed columns.`,
      )
    })

    it('should find all entries in a table ordered by number ascending', async () => {
      const resUsers = await database.withTransaction(async (transaction) =>
        transaction.table<User>('users').findMany({
          orderBy: { number: 'asc' },
        }),
      )

      expect(resUsers).toEqual([...users].sort((a, b) => a.number - b.number))
    })

    it('should find all entries in a table ordered by number descending', async () => {
      const resUsers = await database.withTransaction(async (transaction) =>
        transaction.table<User>('users').findMany({
          orderBy: { number: 'desc' },
        }),
      )

      expect(resUsers).toEqual([...users].sort((a, b) => b.number - a.number))
    })
  })

  describe('join.left', () => {
    it('should find a entity by joined entity id', async () => {
      const randomProject = randomElement(projects, {
        // exclude the projects from the first user as this would make the test succeed every time
        safetyOffset: projectsPerUserLength,
      })

      // find a user by project id
      const res = await database.withTransaction(async (transaction) =>
        transaction
          .join<User, Project>('users', 'projects')
          .left({
            on: { id: 'userId' },
            where: { id: { equals: randomProject.id } },
          })
          .findMany(),
      )

      expect(res).toEqual([
        users.find((user) => user.id === randomProject.userId),
      ])
    })
  })

  describe('update', () => {
    it('should update a single entry in a table', async () => {
      const randomProject = randomElement(projects, {
        safetyOffset: projectsPerUserLength,
      })

      const newName = faker.commerce.productName()

      const resProjects = await database.withTransaction(async (transaction) =>
        transaction.table<Project>('projects').update({
          where: { id: { equals: randomProject.id } },
          data: { name: newName },
        }),
      )

      expect(resProjects).toEqual({ ...randomProject, name: newName })
    })
  })

  describe('updateMany', () => {
    it('should update multiple entries in a table', async () => {
      const randomProjects = randomElements(projects, 3, {
        safetyOffset: projectsPerUserLength,
      })

      const newName = faker.commerce.productName()

      const resProjects = await database.withTransaction(async (transaction) =>
        transaction.table<Project>('projects').updateMany({
          where: {
            id: { in: randomProjects.map((project) => project.id) },
          },
          data: { name: newName },
        }),
      )

      expect(resProjects.map((project) => project.name)).toEqual(
        randomProjects.map(() => newName),
      ) // idk im tired
    })
  })

  describe('delete', () => {
    it('should delete a single entry in a table', async () => {
      const randomProject = randomElement(projects, {
        safetyOffset: projectsPerUserLength,
      })

      const resUsers = await database.withTransaction(async (transaction) => {
        await transaction
          .table<User>('projects')
          .delete({ where: { id: { equals: randomProject.id } } })

        return await transaction.table<User>('users').findMany()
      })

      expect(resUsers).not.toContain(randomProject)
    })
  })

  describe('deleteMany', () => {
    it.todo('should delete multiple entries in a table')
  })
})
