<script lang="ts" setup>
  import { ref, reactive, onActivated, useTemplateRef, watch, nextTick } from 'vue';
  import { Note, NoteFrequency } from '@common/schemas/note';
  import { useRouter } from 'vue-router';
  import { useNotesStore } from '@renderer/store/notes';
  import { useUIStore } from '@renderer/store/ui';
  import { InvokeChannels } from '@preload/channels/invoke';
  import { FocusIcon } from 'lucide-vue-next';
  import Editor from '@renderer/components/Editor/Editor.vue';
  import SelectionList from '@renderer/components/UI/SelectionList.vue';
  import Modal from '@renderer/components/UI/Modal.vue';
  const MAX_NOTE_IDS_HISTORY = 100;
  const router = useRouter();
  const notesStore = useNotesStore();
  const uiStore = useUIStore();
  const modalState = reactive({
    visible: false,
    isDeleting: false,
  });
  const noteIds = ref<string[]>([]);
  const idx = ref(-1);
  const reveal = ref(false);
  const currentNote = ref<Note | null>(null);
  const edit = ref(false);
  const isFetching = ref(false);
  const isLoading = ref(false);
  const bodyFocus = ref(false);
  const seen = ref<Set<string>>(new Set());
  const bodyRef = useTemplateRef('body-editor');
  const headRef = useTemplateRef('head-textarea');
  const frequencyOptions: { text: string; value: NoteFrequency }[] = [
    {
      text: 'Low',
      value: 'low',
    },
    {
      text: 'Normal',
      value: 'normal',
    },
    {
      text: 'High',
      value: 'high',
    },
  ];

  function startEditing() {
    if (!currentNote.value) throw new Error('Cannot edit without a note!');
    edit.value = true;
  }

  function undoEditing() {
    edit.value = false;
    if (bodyRef.value) bodyRef.value.resetContent();
    if (headRef.value) headRef.value.value = currentNote.value?.head || '';
  }

  function saveEditing() {
    if (!currentNote.value) throw new Error('Cannot save without a note!');
    edit.value = false;
    if (bodyRef.value) currentNote.value.body = bodyRef.value.getContent();
    if (headRef.value) currentNote.value.head = headRef.value.value;
    // notesStore.updateNoteWithoutDebounce(currentNote.value);
    uiStore.showToast('Note saved!', 'success');
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
          seen.value.add(nextNote.id);
        }
      } else {
        idx.value++;
        currentNote.value = await notesStore.getNote(noteIds.value[idx.value], false);
      }
    } finally {
      isFetching.value = false;
      reveal.value = false;
    }
  }

  async function goPrev() {
    if (isFetching.value) return;
    if (reveal.value) {
      reveal.value = false;
      return;
    }
    if (idx.value <= 0) return;
    isFetching.value = true;
    try {
      idx.value--;
      currentNote.value = await notesStore.getNote(noteIds.value[idx.value], false);
    } finally {
      isFetching.value = false;
      reveal.value = true;
    }
  }

  function clear() {
    reveal.value = false;
    edit.value = false;
    noteIds.value = [];
    currentNote.value = null;
    idx.value = -1;
    isFetching.value = false;
    isLoading.value = false;
    bodyFocus.value = false;
    seen.value.clear();
  }

  function toggleBodyFocus() {
    if (!reveal.value) return;
    bodyFocus.value = !bodyFocus.value;
  }

  function toggleFrequency(value: NoteFrequency) {
    if (!currentNote.value) throw new Error('Current note is null!');
    currentNote.value.frequency = value;
    window.api.invoke(InvokeChannels.setNoteFrequency, currentNote.value.id, value);
  }

  function closeModal() {
    if (modalState.isDeleting) return;
    modalState.visible = false;
  }

  async function deleteNote() {
    if (!currentNote.value) throw new Error('Cannot delete note without a note!');
    if (modalState.isDeleting) return;
    modalState.isDeleting = true;
    const noteId = currentNote.value.id;
    await window.api.invoke(InvokeChannels.deleteNote, noteId);
    notesStore.refreshTabs();
    // Remove note from note ids, update idx.
    for (let i = idx.value - 1; i >= 0; i--) {
      if (noteIds.value[i] === noteId) {
        idx.value--;
      }
    }
    noteIds.value = noteIds.value.filter((id) => id !== noteId);
    idx.value = Math.min(idx.value, noteIds.value.length - 1);
    // If deleted the latest note seen:
    if (idx.value === noteIds.value.length - 1) {
      reveal.value = true;
      await goNext();
    }
    // If deleted some note in the middle:
    else {
      reveal.value = false;
      currentNote.value = await notesStore.getNote(noteIds.value[idx.value], false);
    }
    edit.value = false;
    modalState.isDeleting = false;
    modalState.visible = false;
    uiStore.showToast('Note deleted!', 'success');
  }

  async function toggleNoteReviewBucket() {
    if (!currentNote.value) throw new Error('Cannot toggle review bucket on non-existing note!');
    await notesStore.toggleNoteReviewBucket(currentNote.value.id);
    await window.api.invoke(InvokeChannels.flashcardsFilter, false);
  }

  onActivated(async () => {
    clear();
    isLoading.value = true;
    const firstNote = await window.api.invoke<Note | null>(InvokeChannels.flashcardsFilter, true);
    currentNote.value = firstNote;
    if (firstNote) {
      noteIds.value.push(firstNote.id);
      idx.value = 0;
      seen.value.add(firstNote.id);
    }
    isLoading.value = false;
  });
  watch(reveal, (newVal) => {
    bodyFocus.value = false;
    nextTick(() => {
      if (newVal) {
        bodyRef.value?.setPreviewOnly(true);
      }
    });
  });
  watch(edit, (newVal) => {
    bodyRef.value?.setPreviewOnly(!newVal);
  });
</script>

<template>
  <div
    v-if="!isLoading"
    class="flashcards-page flex flex-col h-screen"
    :class="{ edit, focus: bodyFocus }"
  >
    <Modal :visible="modalState.visible" @close="closeModal">
      <template #header>Delete note</template>
      <template #body>
        <div>
          Are you sure you want to delete the
          <strong>"{{ currentNote?.title }}"</strong>
          note?
        </div>
        <div class="text-danger my-2">This action cannot be undone!</div>
        <div v-if="modalState.isDeleting" class="text-danger flex items-center">
          <span class="loader mr-2"></span>
          Deleting...
        </div>
      </template>
      <template #footer>
        <div class="flex justify-between">
          <button
            type="button"
            class="btn-secondary"
            :disabled="modalState.isDeleting"
            @click="closeModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn-danger"
            :disabled="modalState.isDeleting"
            @click="deleteNote"
          >
            Delete
          </button>
        </div>
      </template>
    </Modal>

    <FocusIcon v-if="reveal" class="focus-icon" @click="toggleBodyFocus" />

    <main class="flashcards-main grow overflow-y-auto">
      <!-- HEAD -->
      <div v-if="currentNote && !bodyFocus" class="flashcard-head-wrapper">
        <div class="flashcard-head">
          <textarea
            ref="head-textarea"
            :readonly="!edit"
            spellcheck="false"
            :value="currentNote.head"
          ></textarea>
        </div>
      </div>

      <!-- BODY -->
      <div v-if="currentNote && reveal" class="flashcard-body-wrapper">
        <div class="flashcard-body-card">
          <Editor
            ref="body-editor"
            :initial="currentNote.body"
            @toggle-focus-mode="toggleBodyFocus"
          />
        </div>
      </div>

      <!-- META -->
      <div v-if="currentNote && reveal && !bodyFocus" class="flex justify-center my-2 gap-5">
        <div class="flex items-center gap-1">
          <span>Frequency:</span>
          <SelectionList
            :options="frequencyOptions"
            :selected="[currentNote.frequency!]"
            @toggle="toggleFrequency"
          />
        </div>
        <div class="flex items-center gap-1">
          <span>Review bucket:</span>
          <input
            type="checkbox"
            v-model="currentNote.reviewBucket"
            @click="toggleNoteReviewBucket"
          />
        </div>
      </div>

      <div v-else-if="!currentNote" class="absolute-center text-xl opacity-70">
        No notes to show!
      </div>
    </main>

    <!-- FOOTER -->
    <footer v-if="!bodyFocus" class="flashcards-footer select-none relative">
      <template v-if="!edit">
        <button class="btn-primary" @click="startEditing" :disabled="!currentNote || !reveal">
          Edit
        </button>
        <button class="btn-primary" @click="goPrev" :disabled="idx <= 0 && !reveal">Prev</button>
        <button class="btn-primary" @click="goNext" :disabled="!currentNote">Next</button>
        <button class="btn-primary" @click="exit">Exit</button>
      </template>

      <template v-else>
        <button class="btn-primary" @click="undoEditing">Cancel</button>
        <button class="btn-primary" @click="saveEditing">Save</button>
        <button class="btn-danger" @click="modalState.visible = true">Delete</button>
      </template>

      <div
        v-if="!edit && noteIds.length > 0"
        class="card-counter absolute right-0 bottom-full flex items-center"
      >
        <span class="whitespace-nowrap">
          Notes seen: {{ seen.size }} of {{ notesStore.statistics?.filtered }}
        </span>
      </div>
    </footer>
  </div>
</template>
