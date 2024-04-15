import { describe, it, expect } from 'vitest'
import { createInMemoryDatabase } from '@shared/database/inMemory/inMemoryDatabase'
import { uuid } from '@shared/lib/utils/uuid'
import { faker } from '@faker-js/faker'
import { firstOf } from '@shared/lib/utils/list'
import { randomElement } from '@shared/lib/utils/random'

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

describe.sequential('In memory database', () => {
  const database = createInMemoryDatabase()

  const usersLength = 6
  const projectsPerUserLength = 6

  const users: Array<User> = Array.from(
    { length: usersLength },
    (_, index) => ({
      id: uuid(),
      name: faker.person.fullName(),
      number: faker.number.int() - index,
    }),
  )

  const projects: Array<Project> = users.flatMap((user) =>
    Array.from({ length: projectsPerUserLength }, () => ({
      id: uuid(),
      name: faker.commerce.productName(),
      color: faker.color.human(),
      userId: user.id,
    })),
  )

  describe('createTable', () => {
    it('should create a table', async () => {
      await database.open('test', async (transaction) => {
        await transaction.createTable({
          name: 'users',
          schema: { id: 'string', name: 'string', number: 'number' },
        })

        await transaction.createTable({
          name: 'projects',
          schema: {
            id: 'string',
            name: 'string',
            color: 'string',
            userId: 'string',
          },
        })
      })
    })
  })

  describe('table', () => {
    it('should throw an error when trying to access a non-existing table', async () => {
      await database.createTransaction(async (transaction) => {
        expect(() => transaction.table('non-existing-table')).toThrowError(
          `Table "non-existing-table" does not exist.`,
        )
      })
    })
  })

  describe('createMany', () => {
    it('should insert data', async () => {
      const { resUsers, resProjects } = await database.createTransaction(
        async (transaction) => {
          const resUsers = await transaction.table<User>('users').createMany({
            data: users,
          })

          const resProjects = await transaction
            .table<Project>('projects')
            .createMany({
              data: projects,
            })

          return { resUsers, resProjects }
        },
      )

      expect(resUsers).toEqual(users)
      expect(resProjects).toEqual(projects)
    })
  })

  describe('findMany', () => {
    it('should find all entries in a table', async () => {
      const resProjects = await database.createTransaction(
        async (transaction) =>
          transaction.table<Project>('projects').findMany(),
      )

      expect(resProjects).toEqual(projects)
    })

    it('should find all entries in a table with a filter', async () => {
      const randomProject = randomElement(projects, {
        safetyOffset: projectsPerUserLength,
      })

      const resProjects = await database.createTransaction(
        async (transaction) =>
          transaction.table<Project>('projects').findMany({
            where: { color: { equals: randomProject.color } },
          }),
      )

      expect(resProjects).toEqual(
        projects.filter((project) => project.color === randomProject.color),
      )
    })
  })

  describe('findFirst', () => {
    it('should find a single entry in a table with order ascending', async () => {
      const resUser = await database.createTransaction(async (transaction) =>
        transaction.table<User>('users').findFirst({
          orderBy: { number: 'asc' },
        }),
      )

      expect(resUser).toEqual(
        firstOf([...users.sort((a, b) => a.number - b.number)]),
      )
    })

    it('should find a single entry in a table with order descending', async () => {
      const resUser = await database.createTransaction(async (transaction) =>
        transaction.table<User>('users').findFirst({
          orderBy: { number: 'desc' },
        }),
      )

      expect(resUser).toEqual(
        firstOf([...users.sort((a, b) => b.number - a.number)]),
      )
    })

    it('should find a entity in a table with AND filter', async () => {
      const randomProject = randomElement(projects, {
        safetyOffset: projectsPerUserLength,
      })

      const resProjects = await database.createTransaction(
        async (transaction) =>
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

  describe('join.left', () => {
    it('should find a entity by joined entity id', async () => {
      const randomProject = randomElement(projects, {
        // exclude the projects from the first user as this would make the test succeed every time
        safetyOffset: projectsPerUserLength,
      })

      // find a user by project id
      const res = await database.createTransaction(async (transaction) =>
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

      const resProjects = await database.createTransaction(
        async (transaction) =>
          transaction.table<Project>('projects').update({
            where: { id: { equals: randomProject.id } },
            data: { name: newName },
          }),
      )

      expect(resProjects).toEqual({ ...randomProject, name: newName })
    })
  })

  describe('delete', () => {
    it('should delete a single entry in a table', async () => {
      const randomProject = randomElement(projects, {
        safetyOffset: projectsPerUserLength,
      })

      const resUsers = await database.createTransaction(async (transaction) => {
        await transaction
          .table<User>('projects')
          .delete({ where: { id: { equals: randomProject.id } } })

        return await transaction.table<User>('users').findMany()
      })

      expect(resUsers).not.toContain(randomProject)
    })
  })
})
