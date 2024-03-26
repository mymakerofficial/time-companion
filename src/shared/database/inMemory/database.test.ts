import { describe, it, expect } from 'vitest'
import { InMemoryDatabase } from '@shared/database/inMemory/database'
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
  const db = new InMemoryDatabase()

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

  it('should be able to create a table', async () => {
    await db.createTable({
      name: 'users',
      schema: { id: 'string', name: 'string', number: 'number' },
    })

    await db.createTable({
      name: 'projects',
      schema: {
        id: 'string',
        name: 'string',
        color: 'string',
        userId: 'string',
      },
    })
  })

  it('should be able to insert data', async () => {
    const resUsers = await db.table<User>('users').createMany({
      data: users,
    })

    const resProjects = await db.table<Project>('projects').createMany({
      data: projects,
    })

    expect(resUsers).toEqual(users)
    expect(resProjects).toEqual(projects)
  })

  it('should throw an error when trying to access a non-existing table', () => {
    expect(() => db.table('non-existing-table')).toThrowError(
      `Table "non-existing-table" does not exist`,
    )
  })

  it('should be able to find all entries in a table', async () => {
    const resProjects = await db.table<User>('projects').findMany()

    expect(resProjects).toEqual(projects)
  })

  it('should be able to find a single entry in a table with order ascending', async () => {
    const resUser = await db.table<User>('users').findFirst({
      orderBy: { number: 'asc' },
    })

    expect(resUser).toEqual(
      firstOf([...users.sort((a, b) => a.number - b.number)]),
    )
  })

  it('should be able to find a single entry in a table with order descending', async () => {
    const resUser = await db.table<User>('users').findFirst({
      orderBy: { number: 'desc' },
    })

    expect(resUser).toEqual(
      firstOf([...users.sort((a, b) => b.number - a.number)]),
    )
  })

  it('should be able to find all entries in a table with a filter', async () => {
    const randomProject = randomElement(projects, {
      safetyOffset: projectsPerUserLength,
    })

    const resProjects = await db.table<Project>('projects').findMany({
      where: { color: { equals: randomProject.color } },
    })

    expect(resProjects).toEqual(
      projects.filter((p) => p.color === randomProject.color),
    )
  })

  it('should be able to find a entity by joined entity id', async () => {
    const randomProject = randomElement(projects, {
      // exclude the projects from the first user as this would make the test succeed every time
      safetyOffset: projectsPerUserLength,
    })

    // find a user by project id
    const res = await db
      .join<User, Project>('users', 'projects')
      .left({
        on: { id: 'userId' },
        where: { id: { equals: randomProject.id } },
      })
      .findMany()

    expect(res).toEqual([
      users.find((user) => user.id === randomProject.userId),
    ])
  })

  it('should be able to update a single entry in a table', async () => {
    const randomProject = randomElement(projects, {
      safetyOffset: projectsPerUserLength,
    })

    const newName = faker.commerce.productName()

    const resProjects = await db.table<Project>('projects').update({
      where: { id: { equals: randomProject.id } },
      data: { name: newName },
    })

    expect(resProjects).toEqual({ ...randomProject, name: newName })
  })

  it('should be able to delete a single entry in a table', async () => {
    const randomProject = randomElement(projects, {
      safetyOffset: projectsPerUserLength,
    })

    await db
      .table<User>('projects')
      .delete({ where: { id: { equals: randomProject.id } } })

    const resUsers = await db.table<User>('users').findMany()

    expect(resUsers).not.toContain(randomProject)
  })
})
