import { describe, expect, it } from 'vitest'
import { InMemoryDatabase } from '@shared/database/inMemoryDatabase'

interface User {
  name: string
}

describe.sequential('In memory database', () => {
  const database = new InMemoryDatabase()

  it('should be able to create a table', async () => {
    await database.createTable('users')
  })

  it('should be able to insert data', async () => {
    await database.insertOne<User>({
      table: 'users',
      data: { name: 'John Doe' },
    })

    await database.insertOne<User>({
      table: 'users',
      data: { name: 'Jane Doe' },
    })
  })

  it('should be able to get data', async () => {
    const users = await database.getAll<User>({
      table: 'users',
    })

    expect(users).toEqual([{ name: 'John Doe' }, { name: 'Jane Doe' }])
  })

  it('should be able to get data with a filter', async () => {
    const users = await database.getAll<User>({
      table: 'users',
      where: { name: { equals: 'John Doe' } },
    })

    expect(users).toEqual([{ name: 'John Doe' }])
  })

  it('should be able to update data', async () => {
    await database.updateOne<User>({
      table: 'users',
      where: { name: { eq: 'John Doe' } },
      data: { name: 'John Smith' },
    })

    const users = await database.getAll<User>({
      table: 'users',
    })

    expect(users).toEqual([{ name: 'John Smith' }, { name: 'Jane Doe' }])
  })

  it('should be able to delete data', async () => {
    await database.deleteOne<User>({
      table: 'users',
      where: { name: { equals: 'John Smith' } },
    })

    const users = await database.getAll<User>({
      table: 'users',
    })

    expect(users).toEqual([{ name: 'Jane Doe' }])
  })
})
