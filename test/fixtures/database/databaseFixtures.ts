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
  })()
