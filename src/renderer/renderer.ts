import './assets/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { i18n } from '@renderer/locales/locales'
import { migrateApplication } from '@renderer/lib/migrations/applicationMigrator'
import { usePwaService } from '@renderer/services/pwaService'

migrateApplication()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')

usePwaService()
