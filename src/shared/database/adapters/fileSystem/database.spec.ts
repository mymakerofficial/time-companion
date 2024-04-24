import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDatabaseFixtures } from '@test/fixtures/database/databaseFixtures'
import { createFileSystemDBAdapter } from '@shared/database/adapters/fileSystem/database'
import type { HasId } from '@shared/model/helpers/hasId'
import path from 'path'

function byId(a: HasId, b: HasId) {
  return a.id.localeCompare(b.id)
}

describe('File System Database', () => {
  const { database, helpers } = useDatabaseFixtures({
    database: createFileSystemDBAdapter(
      path.join(process.cwd(), '.data', 'test'),
    ),
    databaseName: 'file-system-test-db',
  })

  const upgradeSpy = vi.fn(helpers.upgradeFunction)

  afterEach(async () => {
    upgradeSpy.mockClear()
    await helpers.cleanup()
  })

  it('should open the database', async () => {
    await database.open(helpers.databaseName, 1, upgradeSpy)

    expect(upgradeSpy).toHaveBeenCalledTimes(1)

    expect(await database.getTableNames()).toEqual(['persons', 'pets'])
    expect(await database.getIndexes('persons')).toEqual([
      'age',
      'firstName',
      'username',
    ])
    expect(await database.getIndexes('pets')).toEqual(['name'])
  })

  it('should insert data', async () => {
    await database.open(helpers.databaseName, 1, helpers.upgradeFunction)

    const samplePersons = await helpers.insertSamplePersons(3)

    const personsInDatabase = await helpers.getAllPersonsInDatabase()

    expect(personsInDatabase.sort(byId)).toEqual(samplePersons.sort(byId))
  })

  it('should close the database', async () => {
    await database.open(helpers.databaseName, 1, helpers.upgradeFunction)

    expect(
      async () => await helpers.getAllPersonsInDatabase(),
    ).not.toThrowError()

    await database.close()

    expect(
      async () => await helpers.getAllPersonsInDatabase(),
    ).rejects.toThrowError()
  })

  it('should open the database again', async () => {
    await database.open(helpers.databaseName, 1, upgradeSpy)

    const samplePersons = await helpers.insertSamplePersons(3)

    await database.close()

    // upgrade should not be called because the database already exists at version 1
    await database.open(helpers.databaseName, 1, upgradeSpy)

    expect(upgradeSpy).toHaveBeenCalledTimes(1)

    expect(await database.getTableNames()).toEqual(['persons', 'pets'])
    expect(await database.getIndexes('persons')).toEqual([
      'age',
      'firstName',
      'username',
    ])
    expect(await database.getIndexes('pets')).toEqual(['name'])
    expect((await helpers.getAllPersonsInDatabase()).sort(byId)).toEqual(
      samplePersons.sort(byId),
    )
  })

  it('should close the database and revert all changes when upgrade fails', async () => {
    expect(async () => {
      await database.open(
        helpers.databaseName,
        1,
        async (transaction, newVersion, oldVersion) => {
          await upgradeSpy(transaction, newVersion, oldVersion)

          await transaction.table(helpers.personsTableName).insertMany({
            data: helpers.samplePersons(3),
          })

          throw new Error('Test')
        },
      )
    }).rejects.toThrowError('Test')

    expect(
      async () => await helpers.getAllPersonsInDatabase(),
    ).rejects.toThrowError('Database is not open.')

    await database.open(helpers.databaseName, 1, upgradeSpy)

    expect(upgradeSpy).toHaveBeenCalledTimes(2)
    expect(await helpers.getAllPersonsInDatabase()).toEqual([])
  })

  it('should revert all changes when transaction fails', async () => {
    await database.open(helpers.databaseName, 1, helpers.upgradeFunction)

    const samplePersons = await helpers.insertSamplePersons(6)

    await expect(
      async () =>
        await database.withTransaction(async (transaction) => {
          await transaction.table(helpers.personsTableName).insertMany({
            data: helpers.samplePersons(3),
          })

          throw new Error('Test')
        }),
    ).rejects.toThrowError('Test')

    expect((await helpers.getAllPersonsInDatabase()).sort(byId)).toEqual(
      samplePersons.sort(byId),
    )
  })
})
