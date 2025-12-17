<script setup lang="ts">
  import { ref } from 'vue';
  import { randomId } from '@common/utils/utils';

  const tabGroups = ref([
    {
      id: randomId(),
      width: 1,
      tabs: [],
    },
  ]);

  function computeTabGroupStyle(group: any) {
    return {
      width: `${group.width * 100}%`,
    };
  }

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
</script>

<template>
  <div class="notes-view flex grow relative" style="border: 2px solid orchid">
    <button
      type="button"
      class="absolute top-1 right-1"
      style="border: 1px solid white"
      @click="addTabGroup"
    >
      ||
    </button>
    <div
      v-for="group in tabGroups"
      :key="group.id"
      style="border: 2px solid slateblue"
      :style="computeTabGroupStyle(group)"
    ></div>
  </div>
</template>
