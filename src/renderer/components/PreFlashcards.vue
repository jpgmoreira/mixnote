<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import { useNotesStore } from '@renderer/store/notes';
  import { useConfigStore } from '@renderer/store/config';
  import { YesNo } from '@common/types/yesNo';
  import SelectionList from './UI/SelectionList.vue';
  const router = useRouter();
  const notesStore = useNotesStore();
  const configStore = useConfigStore();
  const reviewBucketOptions: { text: string; value: YesNo }[] = [
    {
      text: 'Yes',
      value: 'yes',
    },
    {
      text: 'No',
      value: 'no',
    },
  ];
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
        <SelectionList
          :options="reviewBucketOptions"
          :selected="configStore.config.reviewBucket"
          @toggle="configStore.toggleConfigReviewBucket"
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
