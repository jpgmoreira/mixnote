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

  function closeTabGroup(groupId: string) {
    // ...
  }
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
      <div v-if="index > 0" class="resizer"></div>
      <!-- Tab area: -->
      <div class="grow" style="border: 2px solid blue">
        <!-- Tab headers: -->
        <div class="flex" style="border: 2px solid mediumaquamarine">
          <!-- Tab group buttons -->
          <div class="ml-auto">
            <button
              type="button"
              v-if="tabGroups.length > 1"
              class="ml-auto"
              @click="closeTabGroup(group.id)"
            >
              x
            </button>
            <button
              type="button"
              v-if="index === tabGroups.length - 1"
              class="ml-auto"
              @click="addTabGroup"
            >
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
  }
</style>
