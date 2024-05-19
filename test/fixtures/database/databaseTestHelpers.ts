import type { Database } from '@shared/database/types/database'
import type { Person, Pet } from '@test/fixtures/database/types'
import { faker } from '@faker-js/faker'
import { firstOf } from '@shared/lib/utils/list'
import { uuid } from '@shared/lib/utils/uuid'
import { randomElements } from '@shared/lib/utils/random'
import { check } from '@renderer/lib/utils'
import type { Nullable } from '@shared/lib/utils/types'
import { personsTable, petsTable } from '@test/fixtures/database/schema'

export class DatabaseTestHelpers {
  constructor(private readonly database: Database) {}

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
      ...firstOf(this.samplePersons(1))!,
      ...override,
    }
  }

  async samplePet(override: Partial<Pet> = {}): Promise<Pet> {
    return {
      ...firstOf(await this.samplePets(1, 1))!,
      ...override,
    }
  }

  async insertPersons(persons: Array<Person>): Promise<Array<Person>> {
    return await this.database.withTransaction(async (transaction) => {
      return await transaction.table(personsTable).insertMany({
        data: persons,
      })
    })
  }

  async insertPets(pets: Array<Pet>): Promise<Array<Pet>> {
    return await this.database.withTransaction(async (transaction) => {
      return await transaction.table(petsTable).insertMany({
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
    return await this.database.table(personsTable).findMany()
  }

  async getPersonsInDatabaseByIds(ids: Array<string>): Promise<Array<Person>> {
    return await this.database.table(personsTable).findMany({
      where: personsTable.id.in(ids),
    })
  }

  async getPersonInDatabaseById(id: string): Promise<Nullable<Person>> {
    return await this.database.table(personsTable).findFirst({
      where: personsTable.id.equals(id),
    })
  }

  async getAllPetsInDatabase(): Promise<Array<Pet>> {
    return await this.database.table(petsTable).findMany()
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

  // opens the database and creates the tables at the latest version
  async openDatabaseIfNotAlreadyOpen(): Promise<void> {
    if (this.database.isOpen) {
      return
    }
    await this.database.open()
  }

  // closes the open database and deletes all databases
  async cleanup(): Promise<void> {
    if (!this.database.isOpen) {
      return
    }

    const tables = await this.database.getTableNames()

    await this.database.withTransaction(async (transaction) => {
      for (const table of tables) {
        await transaction.table(table).deleteAll()
      }
    })
  }
}
