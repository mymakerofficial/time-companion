import type { Database } from '@shared/drizzle/database'

export class ServiceTestHelpers {
  constructor(private readonly database: Database) {}

  async setup() {}

  async cleanup() {}

  async teardown() {}
}
