import { defineConfig } from '@shared/database/schema/defineConfig'
import { projectsTable } from '@shared/model/project'
import { tasksTable } from '@shared/model/task'

export default defineConfig({
  migrations: [() => import('@shared/migrations/001_add_projects_and_tasks')],
  schema: {
    projects: projectsTable,
    tasks: tasksTable,
  },
})
