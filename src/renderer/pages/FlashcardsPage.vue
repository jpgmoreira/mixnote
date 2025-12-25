<script lang="ts" setup>
  import { ref, onActivated, useTemplateRef, watch, nextTick } from 'vue';
  import { Note } from '@common/schemas/note';
  import { useRouter } from 'vue-router';
  import { useNotesStore } from '@renderer/store/notes';
  import { InvokeChannels } from '@preload/channels/invoke';
  import Editor from '@renderer/components/Editor/Editor.vue';
  const MAX_NOTE_IDS_HISTORY = 100;
  const router = useRouter();
  const notesStore = useNotesStore();
  const noteIds = ref<string[]>([]);
  const idx = ref(-1);
  const reveal = ref(false);
  const currentNote = ref<Note | null>(null);
  const edit = ref(false);
  const isFetching = ref(false);
  const bodyFocus = ref(false);
  const bodyRef = useTemplateRef('body-editor');
  function startEditing() {
    edit.value = true;
  }
  function undoEditing() {
    edit.value = false;
  }
  function exit() {
    router.replace({
      name: 'notes',
      params: {
        view: 'flashcards',
      },
    });
  }
  async function goNext() {
    if (isFetching.value) return;
    if (!reveal.value) {
      reveal.value = true;
      return;
    }
    reveal.value = false;
    isFetching.value = true;
    try {
      if (idx.value === noteIds.value.length - 1) {
        const nextNote = await window.api.invoke<Note | null>(InvokeChannels.getNextFlashcard);
        currentNote.value = nextNote;
        if (nextNote) {
          noteIds.value.push(nextNote.id);
          while (noteIds.value.length > MAX_NOTE_IDS_HISTORY) {
            noteIds.value.shift();
          }
          idx.value = noteIds.value.length - 1;
        }
      } else {
        idx.value++;
        currentNote.value = await notesStore.getNote(noteIds.value[idx.value], false);
      }
    } finally {
      isFetching.value = false;
    }
  }
  async function goPrev() {
    if (isFetching.value) return;
    if (reveal.value) {
      reveal.value = false;
      return;
    }
    if (idx.value <= 0) return;
    reveal.value = true;
    isFetching.value = true;
    try {
      idx.value--;
      currentNote.value = await notesStore.getNote(noteIds.value[idx.value], false);
    } finally {
      isFetching.value = false;
    }
  }
  function clear() {
    reveal.value = false;
    edit.value = false;
    noteIds.value = [];
    currentNote.value = null;
    idx.value = -1;
    isFetching.value = false;
    bodyFocus.value = false;
  }
  function toggleBodyFocus() {
    bodyFocus.value = !bodyFocus.value;
  }
  onActivated(async () => {
    clear();
    const firstNote = await window.api.invoke<Note | null>(InvokeChannels.flashcardsFilter, true);
    currentNote.value = firstNote;
    if (firstNote) {
      noteIds.value.push(firstNote.id);
      idx.value = 0;
    }
  });
  watch(reveal, (newVal) => {
    bodyFocus.value = false;
    nextTick(() => {
      if (newVal) {
        bodyRef.value?.togglePreviewOnly();
      }
    });
  });
</script>

<template>
  <div class="flashcards-page flex flex-col h-screen">
    <div v-if="currentNote" class="flex flex-col grow">
      <div v-if="!bodyFocus" class="head-container flex">
        <textarea readonly>{{ currentNote.head }}</textarea>
      </div>
      <div class="flex grow">
        <Editor
          v-if="reveal"
          ref="body-editor"
          class="min-h-full"
          :initial="currentNote.body"
          @toggle-focus-mode="toggleBodyFocus"
        />
      </div>
    </div>
    <div v-else>No note to show!</div>
    <footer
      class="flex justify-evenly mt-auto p-2 select-none sticky bottom-0 left-0 right-0"
      style="border: 1px solid orchid"
    >
      <template v-if="!edit">
        <button type="button" class="btn-primary" @click="startEditing" :disabled="!currentNote">
          Edit
        </button>
        <button type="button" class="btn-primary" @click="goPrev" :disabled="idx <= 0 && !reveal">
          Prev
        </button>
        <button type="button" class="btn-primary" @click="goNext" :disabled="!currentNote">
          Next
        </button>
        <button type="button" class="btn-primary" @click="exit">Exit</button>
      </template>
      <template v-else>
        <button type="button" class="btn-primary" @click="undoEditing">Cancel</button>
        <button type="button" class="btn-primary">Save</button>
        <button type="button" class="btn-danger">Delete</button>
      </template>
    </footer>
  </div>
</template>
