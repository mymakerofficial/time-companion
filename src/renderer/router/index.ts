import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'app-dashboard',
      component: () => import('../views/app/dashboard/DashboardView.vue'),
    },
    {
      path: '/report',
      name: 'app-report',
      component: () => import('../views/app/report/ReportView.vue'),
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
          component: () =>
            import('../views/app/settings/SettingsProjectsView.vue'),
        },
        {
          path: 'tasks',
          name: 'app-settings-tasks',
          component: () =>
            import('../views/app/settings/SettingsTasksView.vue'),
        },
        {
          path: 'preferences',
          name: 'app-settings-general',
          component: () =>
            import('../views/app/settings/SettingsGeneralView.vue'),
        },
        {
          path: 'appearance',
          name: 'app-settings-appearance',
          component: () =>
            import('../views/app/settings/SettingsAppearanceView.vue'),
        },
      ],
    },
    {
      path: '/playground',
      name: 'playground',
      component: () => import('../views/PlaygroundView.vue'),
    },
  ],
})

export default router
