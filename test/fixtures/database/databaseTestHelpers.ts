import type { Database } from '@shared/database/database'
import type { Person, Pet } from '@test/fixtures/database/types'
import { faker } from '@faker-js/faker'
import { firstOf } from '@shared/lib/utils/list'
import { uuid } from '@shared/lib/utils/uuid'
import { randomElements } from '@shared/lib/utils/random'
import { check } from '@renderer/lib/utils'

export class DatabaseTestHelpers {
  constructor(private readonly database: Database) {}

  get databaseName(): string {
    return 'test-database'
  }

  get personsTableName(): string {
    return 'persons'
  }

  get petsTableName(): string {
    return 'pets'
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

  async insertSamplePersons(amount: number): Promise<Array<Person>> {
    const persons = this.samplePersons(amount)

    await this.database.withTransaction(async (transaction) => {
      return await transaction.table<Person>(this.personsTableName).insertMany({
        data: persons,
      })
    })

    return persons
  }

  async insertSamplePets(
    personsAmount: number,
    amountPerPerson: number,
  ): Promise<Array<Pet>> {
    const pets = await this.samplePets(personsAmount, amountPerPerson)

    await this.database.withTransaction(async (transaction) => {
      return await transaction.table<Pet>(this.petsTableName).insertMany({
        data: pets,
      })
    })

    return pets
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

  async getPersonInDatabaseById(id: string): Promise<Person> {
    return await this.database.withTransaction(async (transaction) => {
      return await transaction.table<Person>(this.personsTableName).findFirst({
        where: { id: { equals: id } },
      })
    })
  }

  async clearDatabase(): Promise<void> {
    await this.database.withTransaction(async (transaction) => {
      await transaction.table(this.personsTableName).deleteAll()
      await transaction.table(this.petsTableName).deleteAll()
    })
  }
}
