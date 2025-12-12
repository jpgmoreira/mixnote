import { createMemoryHistory, createRouter } from 'vue-router';
import AppPage from '@renderer/pages/AppPage.vue';

const routes = [
  {
    path: '/',
    component: AppPage,
  },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
