<script lang="ts" setup>
  import { Note } from '@common/schemas/note';
  import { useNotesStore } from '@renderer/store/notes';
  const props = defineProps<{
    source: boolean;
    note: Note | null;
  }>();
  const notesStore = useNotesStore();
</script>

<template>
  <div v-if="note" class="absolute top-0 bottom-0 left-0 right-0">
    <div v-if="!source">NOT SOURCE</div>
    <div v-else>SOURCE</div>
  </div>
</template>
