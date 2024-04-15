import './assets/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { i18n } from '@renderer/locales/locales'
import { migrateApplication } from '@renderer/lib/migrations/applicationMigrator'
import { usePwaService } from '@renderer/services/pwaService'
import { database } from '@renderer/factory/database/database'

migrateApplication()

// TODO this is a hack to create the tables

await database.open('time-companion', async (transaction) => {
  await transaction.createTable({
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

  await transaction.createTable({
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
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')

usePwaService()
