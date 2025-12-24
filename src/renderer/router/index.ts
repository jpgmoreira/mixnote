import { createMemoryHistory, createRouter } from 'vue-router';
import NotesPage from '@renderer/pages/NotesPage.vue';
import SettingsPage from '@renderer/pages/SettingsPage.vue';
import LoginPage from '@renderer/pages/login/LoginPage.vue';
import FlashcardsPage from '@renderer/pages/FlashcardsPage.vue';

const routes = [
  {
    path: '/notes/:view',
    name: 'notes',
    component: NotesPage,
  },
  {
    path: '/login',
    component: LoginPage,
  },
  {
    path: '/settings',
    component: SettingsPage,
  },
  {
    path: '/flashcards',
    component: FlashcardsPage,
  },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
