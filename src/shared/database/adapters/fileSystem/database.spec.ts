import { afterAll, describe, expect, it, vi } from 'vitest'
import { useDatabaseFixtures } from '@test/fixtures/database/databaseFixtures'
import { createFileSystemDBAdapter } from '@shared/database/adapters/fileSystem/database'
import type { HasId } from '@shared/model/helpers/hasId'

function byId(a: HasId, b: HasId) {
  return a.id.localeCompare(b.id)
}

describe.sequential('File System Database', () => {
  const { database, helpers } = useDatabaseFixtures({
    database: createFileSystemDBAdapter(),
    databaseName: 'file-system-test-db',
  })

  const samplePersons = helpers.samplePersons(24).sort(byId)

  afterAll(async () => {
    await helpers.cleanup()
  })

  it('should open the database', async () => {
    const upgradeFn = vi.fn(helpers.upgradeFunction)

    await database.open(helpers.databaseName, 1, upgradeFn)

    const tableNames = await database.getTableNames()
    const personsIndexes = await database.getIndexes('persons')
    const petsIndexes = await database.getIndexes('pets')

    expect(upgradeFn).toHaveBeenCalled()

    expect(tableNames).toEqual(['persons', 'pets'])
    expect(personsIndexes).toEqual(['age', 'firstName', 'username'])
    expect(petsIndexes).toEqual(['name'])
  })

  it('should insert data', async () => {
    await helpers.insertPersons(samplePersons)

    expect(await helpers.getAllPersonsInDatabase()).toEqual(samplePersons)
  })

  it('should close the database', async () => {
    await database.close()

    expect(
      async () => await helpers.getAllPersonsInDatabase(),
    ).rejects.toThrowError()
  })

  it('should open the database again', async () => {
    const upgradeFn = vi.fn(helpers.upgradeFunction)

    await database.open(helpers.databaseName, 1, upgradeFn)

    const tableNames = await database.getTableNames()
    const personsIndexes = await database.getIndexes('persons')
    const petsIndexes = await database.getIndexes('pets')

    expect(upgradeFn).not.toHaveBeenCalled()

    expect(tableNames).toEqual(['persons', 'pets'])
    expect(personsIndexes).toEqual(['age', 'firstName', 'username'])
    expect(petsIndexes).toEqual(['name'])

    expect(await helpers.getAllPersonsInDatabase()).toEqual(samplePersons)
  })
})
