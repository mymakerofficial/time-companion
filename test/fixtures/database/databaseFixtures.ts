import type { Database } from '@shared/database/types/database'
import { createFixtures } from '@test/helpers/createFixtures'
import { DatabaseTestHelpers } from '@test/fixtures/database/databaseTestHelpers'
import { personsTable, petsTable } from '@test/fixtures/database/schema'
import type { DatabaseSchema, TableSchema } from '@shared/database/types/schema'
import type { Person, Pet } from '@test/fixtures/database/types'

interface DatabaseTestFixturesOptions<TSchema extends DatabaseSchema> {
  database: Database<TSchema>
  databaseName?: string
}

interface DatabaseTestFixtures<TSchema extends DatabaseSchema> {
  database: Database<TSchema>
  helpers: DatabaseTestHelpers
  personsTable: TableSchema<Person>
  petsTable: TableSchema<Pet>
}

export const useDatabaseFixtures = <TSchema extends DatabaseSchema>({
  database,
}: DatabaseTestFixturesOptions<TSchema>) =>
  createFixtures<DatabaseTestFixtures<TSchema>>({
    database,
    helpers: ({ database }) => {
      return new DatabaseTestHelpers(database)
    },
    personsTable,
    petsTable,
  })()
