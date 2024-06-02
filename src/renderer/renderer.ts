import './assets/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin as query } from '@tanstack/vue-query'

import App from './App.vue'
import router from './router'
import { i18n } from '@renderer/locales/locales'
import { migrateApplication } from '@renderer/lib/migrations/applicationMigrator'
import { usePwaService } from '@renderer/services/pwaService'
import { preflightService } from '@renderer/factory/service/preflightService'

migrateApplication()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(query, {
  enableDevtoolsV6Plugin: true,
})

app.mount('#app')

usePwaService()

preflightService.start()
