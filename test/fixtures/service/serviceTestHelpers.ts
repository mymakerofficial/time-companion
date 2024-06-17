import type { Database } from '@shared/database/types/database'
import { projectsTable } from '@shared/model/project'
import { tasksTable } from '@shared/model/task'
import { daysTable } from '@shared/model/day'
import { timeEntriesTable } from '@shared/model/timeEntry'

export class ServiceTestHelpers {
  constructor(private readonly database: Database) {}

  async setup() {
    await this.database.open()
  }

  async cleanup() {
    await this.database.table(projectsTable).deleteAll()
    await this.database.table(tasksTable).deleteAll()
    await this.database.table(daysTable).deleteAll()
    await this.database.table(timeEntriesTable).deleteAll()
  }

  async teardown() {
    await this.database.close()
  }
}
