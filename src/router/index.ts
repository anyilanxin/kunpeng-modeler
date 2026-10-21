import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/designer/:type',
      name: 'designer',
      component: () => import('@/views/DesignerView.vue'),
    },
  ],
});

export default router;
