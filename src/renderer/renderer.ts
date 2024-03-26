import './assets/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { i18n } from '@renderer/locales/locales'
import { migrateApplication } from '@renderer/lib/migrations/applicationMigrator'
import { usePwaService } from '@renderer/services/pwaService'
import { database } from '@renderer/facade/database/database'
import { projectService } from '@renderer/facade/service/projectService'

migrateApplication()

// TODO this is a hack to create the tables

database().createTable({
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
})

database().createTable({
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
})

projectService().createProject({
  displayName: 'Test Project from the Browser',
  color: 'red',
  isBillable: true,
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')

usePwaService()
