import { createApp } from 'vue';
import { router } from './router';
import { createPinia } from 'pinia';
import App from './App.vue';
import './md-editor-v3-config';
import './receiver';

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.mount('#app');
