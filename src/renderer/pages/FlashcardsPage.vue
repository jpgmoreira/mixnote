<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { Note } from '@common/schemas/note';
  import { useRouter } from 'vue-router';
  import { useNotesStore } from '@renderer/store/notes';
  const router = useRouter();
  const notesStore = useNotesStore();
  const noteIds = ref<Note[]>([]);
  const idx = ref(0);
  const reveal = ref(false);
  const edit = ref(false);
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
</script>

<template>
  <div class="flashcards-page flex flex-col h-screen">
    <footer class="flex justify-evenly mt-auto p-2" style="border: 1px solid orchid">
      <template v-if="!edit">
        <button type="button" class="btn-primary">Prev</button>
        <button type="button" class="btn-primary">Next</button>
        <button type="button" class="btn-primary" @click="startEditing">Edit</button>
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
