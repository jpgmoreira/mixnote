<script lang="ts" setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useUIStore } from '@renderer/store/ui';
  import Header from '@renderer/components/Header.vue';
  import TreeView from '@renderer/components/UI/TreeView/TreeView.vue';

  const uiStore = useUIStore();

  const initialExplorerWidth = uiStore.settings.explorerWidth;

  const treeAreaWidth = ref(initialExplorerWidth);
  const editorAreaWidth = ref(window.innerWidth - initialExplorerWidth);
  const isResizing = ref(false);

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
    <div class="flex grow" style="border: 2px solid red">
      <div :style="treeAreaStyle">
        <TreeView class="select-none" files-hint file-icon checkbox />
      </div>
      <div
        class="separator shrink-0"
        :class="{ resizing: isResizing }"
        @mousedown="isResizing = true"
      ></div>
      <div
        class="flex flex-col grow"
        :style="editorAreaStyle"
        style="border: 2px solid orchid"
      ></div>
    </div>
  </div>
</template>

<style scoped>
  .notes-page.resizing {
    cursor: ew-resize;
  }
  .separator {
    width: 5px;
    background: rgb(66, 66, 66);
  }
  .separator:hover,
  .separator.resizing {
    background: #0087e7;
    cursor: ew-resize;
  }

  .caret-button {
    transition: transform 0.2s ease;
  }
  .caret-button.rotated {
    transform: rotate(180deg);
  }
</style>
