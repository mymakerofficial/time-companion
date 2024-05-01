import type {
  Database,
  UpgradeFunction,
  UpgradeTransaction,
} from '@shared/database/types/database'
import type { Person, Pet } from '@test/fixtures/database/types'
import { faker } from '@faker-js/faker'
import { firstOf } from '@shared/lib/utils/list'
import { uuid } from '@shared/lib/utils/uuid'
import { randomElements } from '@shared/lib/utils/random'
import { check } from '@renderer/lib/utils'
import type { Nullable } from '@shared/lib/utils/types'

export class DatabaseTestHelpers {
  constructor(
    private readonly database: Database,
    public readonly databaseName: string = 'test-database',
  ) {}

  get newestVersionNumber(): number {
    return 3
  }

  get personsTableName(): string {
    return 'persons'
  }

  get petsTableName(): string {
    return 'pets'
  }

  get upgradeFunction(): UpgradeFunction {
    return async (transaction: UpgradeTransaction, newVersion, oldVersion) => {
      if (newVersion === 1) {
        // do nothing
      }

      if (newVersion === 2) {
        const personsTable = await transaction.createTable({
          name: this.personsTableName,
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

        const petsTable = await transaction.createTable({
          name: this.petsTableName,
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
      }

      if (newVersion === 3) {
        const personsTable = transaction.table<Person>(this.personsTableName)

        await personsTable.createIndex({
          keyPath: 'username',
          unique: true,
        })

        await personsTable.createIndex({
          keyPath: 'age',
          unique: false,
        })
      }
    }
  }

  samplePersons(amount: number): Array<Person> {
    return Array.from({ length: amount }, () => ({
      id: uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      username: faker.internet.userName(),
      gender: faker.person.gender(),
      age: faker.number.int({ min: 18, max: 100 }),
    }))
  }

  async samplePets(
    personsAmount: number,
    amountPerPerson: number,
  ): Promise<Array<Pet>> {
    const persons = await this.getAllPersonsInDatabase()

    check(persons.length > 0, 'No persons in the database to create pets for.')
    check(
      personsAmount <= persons.length,
      'Not enough persons in the database to create pets for.',
    )

    const randomPersons = randomElements(persons, personsAmount)

    return randomPersons.flatMap((person) =>
      Array.from({ length: amountPerPerson }, () => ({
        id: uuid(),
        name: faker.person.firstName(),
        age: faker.number.int({ min: 1, max: 20 }),
        ownerId: person.id,
      })),
    )
  }

  samplePerson(override: Partial<Person> = {}): Person {
    return {
      ...firstOf(this.samplePersons(1)),
      ...override,
    }
  }

  async samplePet(override: Partial<Pet> = {}): Promise<Pet> {
    return {
      ...firstOf(await this.samplePets(1, 1)),
      ...override,
    }
  }

  async insertPersons(persons: Array<Person>): Promise<Array<Person>> {
    return await this.database.withTransaction(async (transaction) => {
      return await transaction.table<Person>(this.personsTableName).insertMany({
        data: persons,
      })
    })
  }

  async insertPets(pets: Array<Pet>): Promise<Array<Pet>> {
    return await this.database.withTransaction(async (transaction) => {
      return await transaction.table<Pet>(this.petsTableName).insertMany({
        data: pets,
      })
    })
  }

  async insertSamplePersons(amount: number): Promise<Array<Person>> {
    const persons = this.samplePersons(amount)

    return await this.insertPersons(persons)
  }

  async insertSamplePets(
    personsAmount: number,
    amountPerPerson: number,
  ): Promise<Array<Pet>> {
    const pets = await this.samplePets(personsAmount, amountPerPerson)

    return await this.insertPets(pets)
  }

  async getAllPersonsInDatabase(): Promise<Array<Person>> {
    return await this.database.withTransaction(async (transaction) => {
      return await transaction.table<Person>(this.personsTableName).findMany()
    })
  }

  async getPersonsInDatabaseByIds(ids: Array<string>): Promise<Array<Person>> {
    return await this.database.withTransaction(async (transaction) => {
      return await transaction.table<Person>(this.personsTableName).findMany({
        where: { id: { in: ids } },
      })
    })
  }

  async getPersonInDatabaseById(id: string): Promise<Nullable<Person>> {
    return await this.database.withTransaction(async (transaction) => {
      return await transaction.table<Person>(this.personsTableName).findFirst({
        where: { id: { equals: id } },
      })
    })
  }

  async getAllPetsInDatabase(): Promise<Array<Pet>> {
    return await this.database.withTransaction(async (transaction) => {
      return await transaction.table<Pet>(this.petsTableName).findMany()
    })
  }

  // deletes all data from all tables, but keeps the tables
  async clearDatabase(): Promise<void> {
    const tableNames = await this.database.getTableNames()

    await this.database.withTransaction(async (transaction) => {
      for (const table of tableNames) {
        await transaction.table(table).deleteAll()
      }
    })
  }

  // opens the database and creates the tables at the specified version
  async openDatabaseAndCreateTablesAtVersion(version: number): Promise<void> {
    await this.database.open(this.databaseName, version, this.upgradeFunction)
  }

  // opens the database and creates the tables at the latest version
  async openDatabaseAndMigrateIfNecessary(): Promise<void> {
    await this.openDatabaseAndCreateTablesAtVersion(this.newestVersionNumber)
  }

  // opens and closes the database at the specified version
  async ensureDatabaseExistsAtVersion(version: number): Promise<void> {
    await this.openDatabaseAndCreateTablesAtVersion(version)
    await this.database.close()
  }

  // closes the open database and deletes all databases
  async cleanup(): Promise<void> {
    try {
      await this.database.close()
    } catch (_) {}

    try {
      await this.database.delete(this.databaseName)
    } catch (_) {}

    try {
      const databases = await this.database.getDatabases()

      for (const database of databases) {
        try {
          await this.database.delete(database.name)
        } catch (_) {}
      }
    } catch (_) {}
  }
}
