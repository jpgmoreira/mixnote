<script lang="ts" setup>
  import { ref, onActivated, useTemplateRef, watch, nextTick } from 'vue';
  import { Note, NoteFrequency } from '@common/schemas/note';
  import { useRouter } from 'vue-router';
  import { useNotesStore } from '@renderer/store/notes';
  import { InvokeChannels } from '@preload/channels/invoke';
  import { FocusIcon } from 'lucide-vue-next';
  import Editor from '@renderer/components/Editor/Editor.vue';
  import SelectionList from '@renderer/components/UI/SelectionList.vue';
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
  const seen = ref<Set<string>>(new Set());
  const bodyRef = useTemplateRef('body-editor');
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
  onActivated(async () => {
    clear();
    const firstNote = await window.api.invoke<Note | null>(InvokeChannels.flashcardsFilter, true);
    currentNote.value = firstNote;
    if (firstNote) {
      noteIds.value.push(firstNote.id);
      idx.value = 0;
      seen.value.add(firstNote.id);
    }
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
  <div class="flashcards-page flex flex-col h-screen" :class="{ edit, focus: bodyFocus }">
    <FocusIcon v-if="reveal" class="focus-icon" @click="toggleBodyFocus" />

    <main class="flashcards-main grow overflow-y-auto">
      <!-- HEAD -->
      <div v-if="currentNote && !bodyFocus" class="flashcard-head-wrapper">
        <div class="flashcard-head">
          <textarea :readonly="!edit" spellcheck="false">{{ currentNote.head }}</textarea>
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
      <div v-if="currentNote && reveal && !bodyFocus" class="flex justify-center my-2 gap-2">
        <span>Frequency:</span>
        <SelectionList
          :options="frequencyOptions"
          :selected="[currentNote.frequency!]"
          @toggle="toggleFrequency"
        />
      </div>

      <div v-else-if="!currentNote" class="absolute-center text-xl opacity-70">
        No notes to show!
      </div>
    </main>

    <!-- FOOTER -->
    <footer v-if="!bodyFocus" class="flashcards-footer select-none relative">
      <template v-if="!edit">
        <button class="btn-primary" @click="startEditing" :disabled="!currentNote">Edit</button>
        <button
          class="btn-primary"
          @click="goPrev"
          :disabled="(idx <= 0 && !reveal) || !currentNote"
        >
          Prev
        </button>
        <button class="btn-primary" @click="goNext" :disabled="!currentNote">Next</button>
        <button class="btn-primary" @click="exit">Exit</button>
      </template>

      <template v-else>
        <button class="btn-primary" @click="undoEditing">Cancel</button>
        <button class="btn-primary">Save</button>
        <button class="btn-danger">Delete</button>
      </template>

      <div
        v-if="!edit && noteIds.length > 0"
        class="card-counter absolute right-0 bottom-full flex items-center"
      >
        <span class="whitespace-nowrap">
          Cards seen: {{ seen.size }} of {{ notesStore.nSelectedNotes }}
        </span>
      </div>
    </footer>
  </div>
</template>
