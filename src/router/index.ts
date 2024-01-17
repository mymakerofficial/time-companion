import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'app-dashboard',
      component: () => import('../views/app/DashboardView.vue')
    },
    {
      path: '/report',
      name: 'app-report',
      component: () => import('../views/app/ReportView.vue')
    },
    {
      path: '/settings',
      name: 'app-settings',
      component: () => import('../views/app/settings/SettingsView.vue'),
      redirect(_) {
        return { name: 'app-settings-projects' }
      },
      children: [
        {
          path: 'projects',
          name: 'app-settings-projects',
          component: () => import('../views/app/settings/SettingProjectsView.vue'),
        },
        {
          path: 'reminders',
          name: 'app-settings-reminders',
          component: () => import('../views/app/settings/SettingRemindersView.vue'),
        },
        {
          path: 'appearance',
          name: 'app-settings-appearance',
          component: () => import('../views/app/settings/SettingAppearanceView.vue'),
        },
      ]
    }
  ]
})

export default router
