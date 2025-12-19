<script setup lang="ts">
  import { ref, reactive, useTemplateRef, onMounted, onBeforeUnmount } from 'vue';
  import { randomId } from '@common/utils/utils';

  const MIN_TAB_WIDTH = 30; // px.

  const tabGroups = ref([
    {
      id: randomId(),
      width: 1,
      tabs: [],
    },
  ]);

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

  /**
   * Add a new tab group: width will be equally distributed on new configuration.
   */
  function addTabGroup() {
    const newTabGroup = {
      id: randomId(),
      width: 0,
      tabs: [],
    };
    tabGroups.value.push(newTabGroup);
    const width = 1 / tabGroups.value.length;
    for (const group of tabGroups.value) {
      group.width = width;
    }
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
    if (tabGroups.value.length < 2) {
      throw new Error('Cannot close a tab group having less than 2 groups!');
    }
    const index = tabGroups.value.findIndex((g) => g.id === groupId);
    if (index === 0) {
      tabGroups.value[1].width += tabGroups.value[0].width;
    } else {
      tabGroups.value[index - 1].width += tabGroups.value[index].width;
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

  //  --- Hooks: ---
  function windowMouseMove(e: MouseEvent) {
    if (!resize.isResizing) return;
    if (!groupsContainer.value) return;
    if (tabGroups.value.length < 2) {
      throw new Error('Cannot resize having less than 2 groups!');
    }
    const container = groupsContainer.value;
    const containerRect = container.getBoundingClientRect();
    // - Arrumar tamanho do último group que o tamanho mínimo tem que ser maior.
    // - Colocar botão de rearranjar todos com os mesmos tamanhos.
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
        const maxCanReduce = group.width - MIN_TAB_WIDTH / containerWidth;
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
        const maxCanReduce = group.width - MIN_TAB_WIDTH / containerWidth;
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
  <div class="notes-view flex grow relative" ref="groups-container">
    <div
      v-for="(group, index) in tabGroups"
      class="flex"
      :key="group.id"
      style="border: 2px solid violet"
      :style="computeTabGroupStyle(group)"
    >
      <!-- Resizer -->
      <div
        v-if="index > 0"
        class="resizer"
        :class="{ resizing: isResizingIndex(index) }"
        @mousedown="resizerMouseDown($event, index)"
      ></div>
      <!-- Tab area: -->
      <div class="grow" style="border: 2px solid blue">
        <!-- Tab headers: -->
        <div class="flex" style="border: 2px solid mediumaquamarine">
          <!-- Tab group buttons -->
          <div class="ml-auto flex">
            <button type="button" v-if="tabGroups.length > 1" @click="closeTabGroup(group.id)">
              x
            </button>
            <button type="button" v-if="index === tabGroups.length - 1" @click="addTabGroup">
              ||
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .resizer {
    height: 100%;
    width: 5px;
    background-color: red;
    cursor: col-resize;
  }
  .resizer.resizing,
  .resizer:hover {
    background-color: chartreuse;
  }
</style>
