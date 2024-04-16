import type { Database } from '@shared/database/database'

export class DatabaseTestFixture {
  constructor(readonly database: Database) {}

  getDatabaseName(): string {
    return 'test-database'
  }
}
