<script lang="ts" setup>
  import Toast from './components/UI/Toast.vue';
  import './styles/index.css';
</script>

<template>
  <Toast />
  <main class="flex flex-col min-h-[100vh]">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </main>
</template>
