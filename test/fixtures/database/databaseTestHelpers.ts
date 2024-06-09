import type { Database } from '@shared/database/types/database'
import {
  type Person,
  personsTable,
  type Pet,
  petsTable,
  type TestRow,
  testTable,
} from '@test/fixtures/database/schema'
import { faker } from '@faker-js/faker'
import { firstOf } from '@shared/lib/utils/list'
import { uuid } from '@shared/lib/utils/uuid'
import { randomElements } from '@shared/lib/utils/random'
import { check } from '@renderer/lib/utils'
import type { MaybeArray, Nullable } from '@shared/lib/utils/types'
import { isArray } from '@shared/lib/utils/checks'
import { entriesOf, objectFromEntries } from '@shared/lib/utils/object'
import { Temporal } from 'temporal-polyfill'

type TestDataOverride<T> = {
  [K in keyof T]: MaybeArray<T[K]>
}

function getOverrideAtIndex<T>(
  override: Partial<TestDataOverride<T>>,
  index: number,
) {
  return objectFromEntries(
    entriesOf(override).map(([key, value]) => [
      key,
      (isArray(value) ? value[index % value.length] : value) as T[keyof T],
    ]),
  )
}

export class DatabaseTestHelpers {
  constructor(private readonly database: Database) {}

  samplePerson(override: Partial<Person> = {}): Person {
    return {
      id: uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      username: faker.internet.userName(),
      gender: faker.person.gender(),
      age: faker.number.int({ min: 18, max: 100 }),
      ...override,
    }
  }

  samplePersons(
    amount: number,
    override: Partial<TestDataOverride<Person>> = {},
  ): Array<Person> {
    return Array.from({ length: amount }, (_, index) =>
      this.samplePerson(getOverrideAtIndex(override, index)),
    )
  }

  samplePet(override: Partial<Pet> = {}): Pet {
    return {
      id: uuid(),
      name: faker.person.firstName(),
      age: faker.number.int({ min: 1, max: 20 }),
      ownerId: uuid(),
      ...override,
    }
  }

  async samplePets(
    personsAmount: number,
    amountPerPerson: number,
    override: Partial<Pet> = {},
  ): Promise<Array<Pet>> {
    const persons = await this.getAllPersonsInDatabase()

    check(persons.length > 0, 'No persons in the database to create pets for.')
    check(
      personsAmount <= persons.length,
      'Not enough persons in the database to create pets for.',
    )

    const randomPersons = randomElements(persons, personsAmount)

    return randomPersons.flatMap((person) =>
      Array.from({ length: amountPerPerson }, () =>
        this.samplePet({
          ownerId: person.id,
          ...override,
        }),
      ),
    )
  }

  sampleTestRow(override: Partial<TestRow> = {}): TestRow {
    return {
      id: uuid(),
      datetime: faker.date.anytime(),
      datetimeIndexed: faker.date.anytime(),
      date: new Date(
        Temporal.PlainDate.from({
          year: faker.number.int({ min: 2000, max: 2100 }),
          month: faker.number.int({ min: 1, max: 12 }),
          day: faker.number.int({ min: 1, max: 28 }),
        }).toString(),
      ),
      dateIndexed: new Date(
        Temporal.PlainDate.from({
          year: faker.number.int({ min: 2000, max: 2100 }),
          month: faker.number.int({ min: 1, max: 12 }),
          day: faker.number.int({ min: 1, max: 28 }),
        }).toString(),
      ),
      time: Temporal.PlainTime.from({
        hour: faker.number.int({ min: 0, max: 23 }),
        minute: faker.number.int({ min: 0, max: 59 }),
        second: faker.number.int({ min: 0, max: 59 }),
      }).toString(),
      timeIndexed: Temporal.PlainTime.from({
        hour: faker.number.int({ min: 0, max: 23 }),
        minute: faker.number.int({ min: 0, max: 59 }),
        second: faker.number.int({ min: 0, max: 59 }),
      }).toString(),
      interval: Temporal.Duration.from({
        days: faker.number.int({ min: 0, max: 100 }),
        hours: faker.number.int({ min: 0, max: 23 }),
        minutes: faker.number.int({ min: 0, max: 59 }),
        seconds: faker.number.int({ min: 0, max: 59 }),
      }).toString(),
      intervalIndexed: Temporal.Duration.from({
        days: faker.number.int({ min: 0, max: 100 }),
        hours: faker.number.int({ min: 0, max: 23 }),
        minutes: faker.number.int({ min: 0, max: 59 }),
        seconds: faker.number.int({ min: 0, max: 59 }),
      }).toString(),
      ...override,
    }
  }

  sampleTestRows(
    amount: number,
    override: Partial<TestDataOverride<TestRow>> = {},
  ): Array<TestRow> {
    return Array.from({ length: amount }, (_, index) =>
      this.sampleTestRow(getOverrideAtIndex(override, index)),
    )
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

  async insertTestRows(testRows: Array<TestRow>): Promise<Array<TestRow>> {
    return await this.database.withTransaction(async (transaction) => {
      return await transaction.table(testTable).insertMany({
        data: testRows,
      })
    })
  }

  async insertSamplePersons(
    amount: number,
    override: Partial<TestDataOverride<Person>> = {},
  ): Promise<Array<Person>> {
    const persons = this.samplePersons(amount, override)

    return await this.insertPersons(persons)
  }

  async insertSamplePerson(override: Partial<Person> = {}): Promise<Person> {
    const person = this.samplePerson(override)

    return firstOf(await this.insertPersons([person]))
  }

  async insertSamplePets(
    personsAmount: number,
    amountPerPerson: number,
    override: Partial<Pet> = {},
  ): Promise<Array<Pet>> {
    const pets = await this.samplePets(personsAmount, amountPerPerson, override)

    return await this.insertPets(pets)
  }

  async insertSamplePet(override: Partial<Pet> = {}): Promise<Pet> {
    const pet = this.samplePet(override)

    return firstOf(await this.insertPets([pet]))
  }

  async insertSampleTestRows(
    amount: number,
    override: Partial<TestDataOverride<TestRow>> = {},
  ): Promise<Array<TestRow>> {
    const testRows = this.sampleTestRows(amount, override)

    return await this.insertTestRows(testRows)
  }

  async insertSampleTestRow(override: Partial<TestRow> = {}): Promise<TestRow> {
    const testRow = this.sampleTestRow(override)

    return firstOf(await this.insertTestRows([testRow]))
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
    const tableNames = await this.database.getActualTableNames()

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

    const tables = await this.database.getActualTableNames()

    await this.database.withTransaction(async (transaction) => {
      for (const table of tables) {
        await transaction.table(table).deleteAll()
      }
    })
  }
}
