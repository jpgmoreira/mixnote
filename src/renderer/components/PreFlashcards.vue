<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import { useNotesStore } from '@renderer/store/notes';
  import { useConfigStore } from '@renderer/store/config';
  const router = useRouter();
  const notesStore = useNotesStore();
  const configStore = useConfigStore();
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
        <span class="value">{{ notesStore.nSelectedNotes }}</span>
      </div>
    </div>

    <div class="section">
      <div class="row">
        <span class="label">Review bucket:</span>
        <input
          type="checkbox"
          v-model="configStore.config.reviewBucket"
          @change="configStore.setReviewBucket"
        />
      </div>
    </div>

    <!-- future configurations here: -->
    <!-- <div class="section">...</div> -->

    <div class="actions">
      <button type="button" class="btn-primary" @click="goFlashcards">Start</button>
    </div>
  </div>
</template>
