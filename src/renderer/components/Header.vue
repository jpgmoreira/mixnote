<script lang="ts" setup></script>

<template>
  <header class="nav-header flex justify-between">
    <div class="flex">
      <RouterLink :to="{ name: 'notes', params: { view: 'notes' } }" class="router-link">
        Notes
      </RouterLink>
      <RouterLink :to="{ name: 'notes', params: { view: 'flashcards' } }" class="router-link">
        Flashcards
      </RouterLink>
    </div>
    <div class="flex">
      <RouterLink to="/graph" class="router-link">Graph</RouterLink>
      <RouterLink to="/settings" class="router-link">Settings</RouterLink>
    </div>
  </header>
</template>
