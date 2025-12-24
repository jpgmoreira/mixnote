<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  const props = defineProps<{
    nSelectedFiles: number;
  }>();
  const router = useRouter();
  function goFlashcards() {
    router.replace('/flashcards');
  }
</script>

<template>
  <div class="pre-flashcards">
    <h1 class="title">Flashcards study</h1>

    <div class="section">
      <div class="row">
        <span class="label">Selected notes</span>
        <span class="value">{{ nSelectedFiles }}</span>
      </div>
    </div>

    <!-- future configurations here: -->
    <!-- <div class="section">...</div> -->

    <div class="actions">
      <button type="button" class="btn-primary" @click="goFlashcards">Start</button>
    </div>
  </div>
</template>
