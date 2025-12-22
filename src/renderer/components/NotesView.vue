<script setup lang="ts">
  import { reactive, watch, useTemplateRef, onMounted, onBeforeUnmount } from 'vue';
  import { randomId } from '@common/utils/utils';
  import { useNotesStore } from '@renderer/store/notes';
  import { storeToRefs } from 'pinia';
  import Editor from './Editor/Editor.vue';
  import { TabGroup } from '@common/schemas/tabs';

  const MIN_GROUP_WIDTH = 30; // px.
  const MIN_LAST_GROUP_WIDTH = 90; // px.

  const notesStore = useNotesStore();

  const { tabGroups } = storeToRefs(notesStore);

  const resize = reactive({
    isResizing: false,
    index: 0,
    left: 0,
  });

  const groupsContainer = useTemplateRef('groups-container');

  function computeTabGroupStyle(group: any) {
    return {
      width: `${group.width * 100}%`,
    };
  }

  function resetGroupWidths() {
    if (!tabGroups.value || !tabGroups.value.length)
      throw new Error('Cannot normalize empty tab groups!');
    const width = 1 / tabGroups.value.length;
    for (const group of tabGroups.value) {
      group.width = width;
    }
  }

  /**
   * Add a new tab group: width will be equally distributed on new configuration.
   */
  function addTabGroup() {
    if (!tabGroups.value) throw new Error('Uninitialized tab groups.');
    const newTabGroup = {
      id: randomId(),
      width: 0,
      active: false,
      tabs: [],
    };
    tabGroups.value.push(newTabGroup);
    resetGroupWidths();
  }

  /**
   * Close a tab group:
   *   - Closing the first tab group:
   *       The second tab group will consume its width.
   *   - Closing any other tab group:
   *       The tab group immediatelly to the left will
   *       consume its width.
   */
  function closeTabGroup(groupId: string) {
    if (!tabGroups.value) throw new Error('Uninitialized tab groups.');
    if (tabGroups.value.length < 2) {
      throw new Error('Cannot close a tab group having less than 2 groups!');
    }
    const index = tabGroups.value.findIndex((g) => g.id === groupId);
    if (index === 0) {
      tabGroups.value[1].width += tabGroups.value[0].width;
    } else {
      tabGroups.value[index - 1].width += tabGroups.value[index].width;
    }
    const group = tabGroups.value[index];
    for (const tab of group.tabs) {
      notesStore.closeTab(group, tab.id);
    }
    tabGroups.value.splice(index, 1);
  }

  function resizerMouseDown(e: MouseEvent, index: number) {
    resize.isResizing = true;
    resize.index = index;
    resize.left = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }
  function isResizingIndex(index: number) {
    return resize.isResizing && resize.index === index;
  }

  function setActiveGroup(index: number) {
    if (!tabGroups.value) throw new Error('Uninitialized tab groups.');
    const groups = tabGroups.value;
    if (!groups.length) return;
    if (groups.findIndex((g) => g.active) === index) return;
    groups.forEach((group) => (group.active = false));
    if (index < groups.length) {
      groups[index].active = true;
    } else {
      groups[0].active = true;
    }
  }

  //  --- Watches: ---

  watch(tabGroups, notesStore.updateTabGroups, { deep: true });

  //  --- Hooks: ---

  function windowMouseMove(e: MouseEvent) {
    if (!tabGroups.value) return;
    if (!resize.isResizing) return;
    if (!groupsContainer.value) return;
    if (tabGroups.value.length < 2) {
      throw new Error('Cannot resize having less than 2 groups!');
    }
    const container = groupsContainer.value;
    const containerRect = container.getBoundingClientRect();
    if (e.clientX < containerRect.left || e.clientX > containerRect.right) {
      return;
    }
    const containerWidth = containerRect.width || 1;
    const delta = e.clientX - resize.left;
    let totalRatio = Math.abs(delta / containerWidth);
    const index = resize.index;
    // Stacking effect:
    if (delta < 0) {
      // to left.
      const prevWidth = tabGroups.value[index].width;
      for (let i = index - 1; i >= 0; i--) {
        const group = tabGroups.value[i];
        const maxCanReduce = group.width - MIN_GROUP_WIDTH / containerWidth;
        if (maxCanReduce <= 0) continue;
        const toReduce = Math.min(maxCanReduce, totalRatio);
        totalRatio -= toReduce;
        group.width -= toReduce;
        tabGroups.value[index].width += toReduce;
        if (totalRatio <= 0) break;
      }
      const currWidth = tabGroups.value[index].width;
      if (prevWidth !== currWidth) {
        resize.left = e.clientX;
      }
    } else {
      // to right.
      const prevWidth = tabGroups.value[index - 1].width;
      for (let i = index; i < tabGroups.value.length; i++) {
        const group = tabGroups.value[i];
        const limit = i === tabGroups.value.length - 1 ? MIN_LAST_GROUP_WIDTH : MIN_GROUP_WIDTH;
        const maxCanReduce = group.width - limit / containerWidth;
        if (maxCanReduce <= 0) continue;
        const toReduce = Math.min(maxCanReduce, totalRatio);
        totalRatio -= toReduce;
        group.width -= toReduce;
        tabGroups.value[index - 1].width += toReduce;
        if (totalRatio <= 0) break;
      }
      const currWidth = tabGroups.value[index - 1].width;
      if (prevWidth !== currWidth) {
        resize.left = e.clientX;
      }
    }
  }
  function windowMouseUp() {
    resize.isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
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
  <div class="notes-view flex" ref="groups-container">
    <!-- Tab groups -->
    <div
      v-if="tabGroups"
      v-for="(group, index) in tabGroups"
      class="tab-group flex overflow-hidden"
      :key="group.id"
      :style="computeTabGroupStyle(group)"
      @click="setActiveGroup(index)"
      :class="{ active: group.active }"
    >
      <!-- Resizer -->
      <div
        v-if="index > 0"
        class="resizer"
        :class="{ resizing: isResizingIndex(index) }"
        @mousedown="resizerMouseDown($event, index)"
        @click.stop
      ></div>
      <!-- Tab area: -->
      <div class="flex grow flex-col max-w-full relative">
        <!-- Tab headers: -->
        <div class="flex flex-wrap">
          <div
            v-for="tab in group.tabs"
            class="tab-header flex justify-between whitespace-nowrap"
            :class="{ preview: tab.preview, active: tab.active }"
            @click="notesStore.tabHeaderClick(group, tab.id)"
          >
            <span class="tab-title">{{ notesStore.getTabTitle(tab) }}</span>
            <span @click="notesStore.closeTab(group, tab.id)">x</span>
          </div>
          <!-- Tab group buttons -->
          <div class="ml-auto flex" @click.stop>
            <button type="button" v-if="tabGroups.length > 1" @click="closeTabGroup(group.id)">
              x
            </button>
            <template v-if="index === tabGroups.length - 1">
              <button type="button" @click="resetGroupWidths">R</button>
              <button type="button" @click="addTabGroup">||</button>
            </template>
          </div>
        </div>
        <!-- Tab content -->
        <div v-if="notesStore.hasActiveNote(group)" class="grow relative overflow-y-auto">
          <Editor :note="notesStore.getActiveNote(group)" />
        </div>
        <div v-else class="absolute-center text-lg opacity-70 whitespace-nowrap select-none">
          No note selected
        </div>
      </div>
    </div>
  </div>
</template>
