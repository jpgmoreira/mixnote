<script lang="ts" setup>
  import { ref } from 'vue';
  import { MdEditor } from 'md-editor-v3';
  import { Note } from '@common/schemas/note';
  import { useNotesStore } from '@renderer/store/notes';

  const props = defineProps<{
    source: boolean;
    note: Note | null;
  }>();

  const headContent = ref(props.note?.head || '');
  const notesStore = useNotesStore();
</script>

<template>
  <div v-if="note" class="absolute top-0 bottom-0 left-0 right-0">
    <div v-if="!source">
      <MdEditor
        v-model="headContent"
        theme="dark"
        codeTheme="atom"
        language="en-US"
        :toolbarsExclude="['mermaid', 'image']"
      />
    </div>
    <div v-else>SOURCE</div>
  </div>
</template>
