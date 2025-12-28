<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useNotesStore } from '@renderer/store/notes';
  import { useConfigStore } from '@renderer/store/config';
  import { YesNo } from '@common/types/yesNo';
  import SelectionList from './UI/SelectionList.vue';
  import { onMounted } from 'vue';
  import { DEFAULT_HF_PROBABILITY, DEFAULT_LF_PROBABILITY } from '@common/schemas/config';
  const router = useRouter();
  const notesStore = useNotesStore();
  const configStore = useConfigStore();
  const hfProbability = ref(configStore.config.hfProbability * 100);
  const lfProbability = ref(configStore.config.lfProbability * 100);
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
  async function toggleReviewBucket(value: YesNo) {
    await configStore.toggleConfigReviewBucket(value);
    notesStore.fetchNoteStatistics();
  }
  function updateHfProbability() {
    configStore.updateHfProbability(hfProbability.value);
  }
  function updateLfProbability() {
    configStore.updateLfProbability(lfProbability.value);
  }
  function resetProbabilities() {
    hfProbability.value = DEFAULT_HF_PROBABILITY * 100;
    lfProbability.value = DEFAULT_LF_PROBABILITY * 100;
    updateHfProbability();
    updateLfProbability();
  }
  const probabilitySum = computed(() => hfProbability.value + lfProbability.value);
  onMounted(() => {
    notesStore.fetchNoteStatistics();
  });
</script>

<template>
  <div class="pre-flashcards">
    <h1 class="title">Flashcards study</h1>

    <div class="section">
      <div class="row">
        <span class="label">Total number of notes</span>
        <span class="value">{{ notesStore.statistics?.total || 0 }}</span>
      </div>
      <div class="row">
        <span class="label">Review bucket size</span>
        <span class="value">{{ notesStore.statistics?.reviewBucketTotal || 0 }}</span>
      </div>
    </div>

    <div class="section">
      <div class="row">
        <span class="label">Selected notes</span>
        <span class="value">{{ notesStore.statistics?.selected || 0 }}</span>
      </div>
      <div class="row">
        <span class="label">Filtered notes (selected + bucket)</span>
        <span class="value">{{ notesStore.statistics?.filtered || 0 }}</span>
      </div>
    </div>

    <div class="section">
      <div class="row">
        <span class="label">Review bucket:</span>
        <SelectionList
          :options="reviewBucketOptions"
          :selected="configStore.config.reviewBucket"
          @toggle="toggleReviewBucket"
        />
      </div>
      <div class="row">
        <span class="label">High frequency probability (%)</span>
        <input type="number" v-model="hfProbability" @change="updateHfProbability" />
      </div>
      <div class="row">
        <span class="label">Low frequency probability (%)</span>
        <input type="number" v-model="lfProbability" @change="updateLfProbability" />
      </div>
      <div class="row">
        <button type="button" class="btn-primary ml-auto" @click="resetProbabilities">Reset</button>
      </div>
      <div v-if="probabilitySum > 100" class="row">
        <span class="label">
          <div class="text-danger">
            The sum of the probabilities should be less than or equal 100!
          </div>
        </span>
      </div>
    </div>

    <!-- future configurations here: -->
    <!-- <div class="section">...</div> -->

    <div class="actions">
      <button type="button" class="btn-primary" @click="goFlashcards">Start</button>
    </div>
  </div>
</template>
