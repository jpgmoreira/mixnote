<script lang="ts" setup>
  import { ref } from 'vue';
  import { Note } from '@common/schemas/note';
  import Editor from './Editor.vue';
  const props = defineProps<{ note: Note }>();
  const noteHead = ref(props.note.head);
  const noteBody = ref(props.note.body);
</script>

<template>
  <Editor :content="noteHead" />
</template>
