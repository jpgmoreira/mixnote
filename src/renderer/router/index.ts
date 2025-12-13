import { createMemoryHistory, createRouter } from 'vue-router';
import NotesPage from '@renderer/pages/NotesPage.vue';
import LoginPage from '@renderer/pages/login/LoginPage.vue';

const routes = [
  {
    path: '/notes',
    component: NotesPage,
  },
  {
    path: '/login',
    component: LoginPage,
  },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
