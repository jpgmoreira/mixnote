<script lang="ts" setup>
  import { ref, useTemplateRef } from 'vue';
  import { Note } from '@common/schemas/note';
  import { useNotesStore } from '@renderer/store/notes';
  import { parseTimestamp } from '@common/utils/dateUtils';
  import Editor from './Editor/Editor.vue';
  const props = defineProps<{ note: Note }>();
  const notesStore = useNotesStore();
  const bodyRef = useTemplateRef('body-ref');
  const headContent = ref(props.note.head);
  const noteChangeTimer = ref<ReturnType<typeof setTimeout> | undefined>(undefined);
  const focus = ref(false);
  function toggleFocus() {
    focus.value = !focus.value;
  }
  function noteChange(field: 'head' | 'body') {
    clearTimeout(noteChangeTimer.value);
    noteChangeTimer.value = setTimeout(() => {
      if (!bodyRef.value) return;
      let content = '';
      if (field === 'head') content = headContent.value;
      else content = bodyRef.value.getContent();
      notesStore.updateNoteContent(props.note.id, field, content);
    }, 500);
  }
</script>

<template>
  <div class="editor-container h-full relative overflow-y-auto overflow-x-hidden">
    <div class="flex flex-col absolute top-0 left-0 w-full min-h-full">
      <div v-if="!focus" class="p-1">
        <div class="whitespace-nowrap">
          <b>Title:</b>
          {{ props.note.title }}
        </div>
        <div class="flex flex-wrap">
          <div class="grow whitespace-nowrap">
            <b>Created at:</b>
            {{ parseTimestamp(props.note.createdAt) }}
          </div>
          <div class="grow whitespace-nowrap">
            <b>Last modified:</b>
            {{ parseTimestamp(props.note.lastModified) }}
          </div>
        </div>
      </div>
      <textarea
        v-if="!focus"
        class="head-textarea"
        placeholder="HEAD"
        spellcheck="false"
        v-model="headContent"
        @input="noteChange('head')"
      ></textarea>
      <Editor
        class="grow"
        ref="body-ref"
        :initial="props.note.body"
        @change="noteChange('body')"
        @toggle-focus-mode="toggleFocus"
        placeholder="BODY"
      />
    </div>
  </div>
</template>
