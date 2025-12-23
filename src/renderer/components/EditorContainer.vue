<script lang="ts" setup>
  import { ref } from 'vue';
  import { Note } from '@common/schemas/note';
  import { useNotesStore } from '@renderer/store/notes';
  import Editor from './Editor/Editor.vue';
  const props = defineProps<{ note: Note }>();
  const notesStore = useNotesStore();
  const noteHead = ref(props.note.head);
  const noteBody = ref(props.note.body);
</script>

<template>
  <Editor
    :initial="noteBody"
    @change="notesStore.updateNoteContent(props.note.id, 'body', $event)"
  />
</template>
