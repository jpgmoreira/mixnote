<script lang="ts" setup>
  import Header from '@renderer/components/Header.vue';
  import { useProfileStore } from '@renderer/store/profile';
  import { useRouter } from 'vue-router';
  import { APP_NAME } from '@common/constants';
  const router = useRouter();
  const profileStore = useProfileStore();
  async function logout() {
    await profileStore.logout();
    document.title = APP_NAME;
    router.replace('/login');
  }
</script>

<template>
  <div class="h-screen">
    <Header />
    <div>Settings page!</div>
    <button type="button" class="btn-warning" @click="logout">Logout</button>
  </div>
</template>
