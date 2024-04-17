import './assets/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { i18n } from '@renderer/locales/locales'
import { migrateApplication } from '@renderer/lib/migrations/applicationMigrator'
import { usePwaService } from '@renderer/services/pwaService'
import { database } from '@renderer/factory/database/database'
import type { ProjectEntityDto } from '@shared/model/project'
import type { TaskEntityDto } from '@shared/model/task'

migrateApplication()

// TODO this is a hack to create the tables

await database.open('time-companion', 1, async (transaction, newVersion) => {
  const projectsTable = await transaction.createTable<ProjectEntityDto>({
    name: 'projects',
    schema: {
      id: 'string',
      displayName: 'string',
      color: 'string',
      isBillable: 'boolean',
      createdAt: 'string',
      modifiedAt: 'string',
      deletedAt: 'string',
    },
    primaryKey: 'id',
  })

  await projectsTable.createIndex({
    keyPath: 'displayName',
    unique: true,
  })

  await projectsTable.insert({
    data: {
      id: '1',
      displayName: 'Project 1',
      color: 'green',
      isBillable: true,
      createdAt: new Date().toISOString(),
      modifiedAt: null,
      deletedAt: null,
    },
  })

  const tasksTable = await transaction.createTable<TaskEntityDto>({
    name: 'tasks',
    schema: {
      id: 'string',
      projectId: 'string',
      displayName: 'string',
      color: 'string',
      createdAt: 'string',
      modifiedAt: 'string',
      deletedAt: 'string',
    },
    primaryKey: 'id',
  })

  await tasksTable.createIndex({
    keyPath: 'displayName',
    unique: true,
  })

  await tasksTable.insert({
    data: {
      id: '1',
      projectId: '1',
      displayName: 'Task 1',
      color: 'green',
      createdAt: new Date().toISOString(),
      modifiedAt: null,
      deletedAt: null,
    },
  })
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')

usePwaService()
