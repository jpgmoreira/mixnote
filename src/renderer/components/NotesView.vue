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
    <div
      v-for="(group, index) in tabGroups"
      :key="group.id"
      style="border: 2px solid slateblue"
      :style="computeTabGroupStyle(group)"
    >
      <div class="flex" style="border: 2px solid mediumaquamarine">
        <button v-if="index === tabGroups.length - 1" class="ml-auto" @click="addTabGroup">
          ||
        </button>
      </div>
    </div>
  </div>
</template>
