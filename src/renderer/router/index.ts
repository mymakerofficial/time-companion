import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      rootPath: '/',
      name: 'app-dashboard',
      component: () => import('../views/app/dashboard/DashboardView.vue'),
    },
    {
      rootPath: '/report',
      name: 'app-report',
      component: () => import('../views/app/report/ReportView.vue'),
    },
    {
      rootPath: '/settings',
      name: 'app-settings',
      component: () => import('../views/app/settings/SettingsView.vue'),
      redirect(_) {
        return { name: 'app-settings-projects' }
      },
      children: [
        {
          rootPath: 'projects',
          name: 'app-settings-projects',
          component: () =>
            import('../views/app/settings/SettingsProjectsView.vue'),
        },
        {
          rootPath: 'reminders',
          name: 'app-settings-reminders',
          component: () =>
            import('../views/app/settings/SettingsRemindersView.vue'),
        },
        {
          rootPath: 'preferences',
          name: 'app-settings-general',
          component: () =>
            import('../views/app/settings/SettingsGeneralView.vue'),
        },
        {
          rootPath: 'appearance',
          name: 'app-settings-appearance',
          component: () =>
            import('../views/app/settings/SettingsAppearanceView.vue'),
        },
      ],
    },
    {
      rootPath: '/playground',
      name: 'playground',
      component: () => import('../views/PlaygroundView.vue'),
    },
  ],
})

export default router
