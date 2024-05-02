import type { Database } from '@shared/database/types/database'
import { createFixtures } from '@test/helpers/createFixtures'
import { DatabaseTestHelpers } from '@test/fixtures/database/databaseTestHelpers'

interface DatabaseTestFixturesOptions {
  database: Database
  databaseName?: string
}

interface DatabaseTestFixtures {
  database: Database
  helpers: DatabaseTestHelpers
  personsTable: DatabaseTestHelpers['personsTable']
  petsTable: DatabaseTestHelpers['petsTable']
}

export const useDatabaseFixtures = ({
  database,
  databaseName,
}: DatabaseTestFixturesOptions) =>
  createFixtures<DatabaseTestFixtures>({
    database,
    helpers: ({ database }) => {
      return new DatabaseTestHelpers(database, databaseName)
    },
    personsTable: ({ helpers }) => helpers.personsTable,
    petsTable: ({ helpers }) => helpers.petsTable,
  })()
