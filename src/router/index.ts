import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      input: 'home',
      component: () => import('../views/HomeView.vue')
    }
  ]
})

export default router
