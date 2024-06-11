import { defineConfig } from '@shared/database/schema/defineConfig'
import { projectsTable } from '@shared/model/project'
import { tasksTable } from '@shared/model/task'
import { daysTable } from '@shared/model/day'
import { timeEntriesTable } from '@shared/model/timeEntry'

export default defineConfig({
  migrations: [
    () => import('@shared/migrations/001_add_projects_and_tasks'),
    () => import('@shared/migrations/002_add_days_and_time_entries'),
  ],
  schema: {
    projects: projectsTable,
    tasks: tasksTable,
    days: daysTable,
    timeEntries: timeEntriesTable,
  },
})
