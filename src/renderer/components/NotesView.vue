<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { randomId } from '@common/utils/utils';

  const tabGroups = ref([
    {
      id: randomId(),
      width: 1,
      tabs: [],
    },
  ]);

  const isResizing = ref(false);

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

  function resizerMouseDown() {
    isResizing.value = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  //  --- Hooks: ---
  function windowMouseMove(e: MouseEvent) {
    if (!isResizing.value) return;
    // Implement here...
  }
  function windowMouseUp() {
    isResizing.value = false;
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
  <div class="notes-view flex grow relative">
    <div
      v-for="(group, index) in tabGroups"
      class="flex"
      :key="group.id"
      style="border: 2px solid violet"
      :style="computeTabGroupStyle(group)"
    >
      <!-- Resizer -->
      <div v-if="index > 0" class="resizer" @mousedown="resizerMouseDown"></div>
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
  .resizer:hover {
    background-color: chartreuse;
  }
</style>
