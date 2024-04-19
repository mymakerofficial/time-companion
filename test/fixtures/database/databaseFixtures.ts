import type { Database } from '@shared/database/database'
import { createFixtures } from '@test/helpers/createFixtures'
import { DatabaseTestHelpers } from '@test/fixtures/database/databaseTestHelpers'

interface DatabaseTestFixtures {
  database: Database
  helpers: DatabaseTestHelpers
}

export const useDatabaseFixtures = (database: Database) =>
  createFixtures<DatabaseTestFixtures>({
    database,
    helpers: ({ database }) => {
      return new DatabaseTestHelpers(database)
    },
  })()
