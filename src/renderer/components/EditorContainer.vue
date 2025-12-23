<script lang="ts" setup>
  import { useTemplateRef } from 'vue';
  import { Note } from '@common/schemas/note';
  import { useNotesStore } from '@renderer/store/notes';
  import Editor from './Editor/Editor.vue';
  const props = defineProps<{ note: Note }>();
  const notesStore = useNotesStore();
  const bodyRef = useTemplateRef('body-ref');
  function bodyBlur() {
    if (!bodyRef.value) throw new Error('No body ref!');
    const content = bodyRef.value.getContent();
    notesStore.updateNoteContent(props.note.id, 'body', content);
  }
</script>

<template>
  <div class="editor-container h-full relative overflow-y-auto">
    <div class="flex flex-col absolute top-0 left-0 w-full min-h-full">
      <textarea class="head-textarea" placeholder="HEAD" spellcheck="false"></textarea>
      <Editor
        class="grow"
        ref="body-ref"
        :initial="props.note.body"
        @blur="bodyBlur"
        placeholder="BODY"
      />
    </div>
  </div>
</template>
