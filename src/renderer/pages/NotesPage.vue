<script lang="ts" setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useUIStore } from '@renderer/store/ui';
  import { useNotesStore } from '@renderer/store/notes';
  import { useRoute } from 'vue-router';
  import Header from '@renderer/components/Header.vue';
  import TreeView from '@renderer/components/UI/TreeView/TreeView.vue';
  import NotesView from '@renderer/components/NotesView.vue';

  const route = useRoute();

  const uiStore = useUIStore();
  const notesStore = useNotesStore();

  const initialExplorerWidth = uiStore.settings.explorerWidth;

  const treeAreaWidth = ref(initialExplorerWidth);
  const editorAreaWidth = ref(window.innerWidth - initialExplorerWidth);
  const isResizing = ref(false);

  const view = computed(() => route.params.view);

  const treeAreaStyle = computed(() => ({
    width: `${treeAreaWidth.value}px`,
  }));
  const editorAreaStyle = computed(() => ({
    width: `${editorAreaWidth.value}px`,
  }));

  function windowMouseUp() {
    isResizing.value = false;
  }
  function windowMouseMove(e: MouseEvent) {
    if (!isResizing.value) return;
    treeAreaWidth.value = e.clientX;
    editorAreaWidth.value = window.innerWidth - e.clientX;
    uiStore.updateSettings({ explorerWidth: e.clientX });
    window.getSelection()?.removeAllRanges();
  }
  onMounted(() => {
    window.addEventListener('mouseup', windowMouseUp);
    window.addEventListener('mousemove', windowMouseMove);
  });
  onBeforeUnmount(() => {
    window.removeEventListener('mouseup', windowMouseUp);
    window.removeEventListener('mousemove', windowMouseMove);
  });
</script>

<template>
  <div class="notes-page h-screen flex flex-col overflow-hidden" :class="{ resizing: isResizing }">
    <Header />
    <div class="flex grow">
      <div :style="treeAreaStyle">
        <TreeView
          class="select-none"
          files-hint
          file-icon
          :checkbox="view === 'flashcards'"
          :selectionOnly="view === 'flashcards'"
          @rename="notesStore.renameNote"
          @delete-single="notesStore.refreshTabs"
          @delete-multiple="notesStore.refreshTabs"
        />
      </div>
      <div class="custom-resizer shrink-0" @mousedown="isResizing = true"></div>
      <div class="flex flex-col grow" :style="editorAreaStyle">
        <NotesView v-if="view === 'notes'" />
        <div v-else>AAAAA</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .notes-page.resizing {
    cursor: ew-resize;
  }
  .caret-button {
    transition: transform 0.2s ease;
  }
  .caret-button.rotated {
    transform: rotate(180deg);
  }
</style>
