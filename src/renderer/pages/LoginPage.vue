<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import { EventEmitter } from '@common/events/eventEmitter';
  import { Events } from '@renderer/events';
  import { getEmptyProfileRegistry, ProfileRecord, ProfileRegistry } from '@common/schemas/profile';
  import { StartupDTO } from '@common/dto/startupDTO';
  import { parseTimestamp } from '@common/utils/dateUtils';
  EventEmitter.instance.on(Events.startup, initData);

  const registry = ref<ProfileRegistry>(getEmptyProfileRegistry());
  const selected = ref<ProfileRecord | null>(null);

  const modals = reactive({
    create: false,
    rename: false,
    delete: false,
  });

  const records = computed(() => registry.value.profileRecords);

  function initData(data: StartupDTO) {
    registry.value = data.registry;
  }

  function selectRow(profile: ProfileRecord) {
    selected.value = profile;
  }

  function openCreateModal() {}
  function login() {}

  function startRename() {}
</script>

<template>
  <div class="flex flex-col h-screen login-page">
    <div class="flex justify-center items-center h-10 text-lg">Select or create a profile</div>
    <div class="flex grow table-container overflow-y-auto">
      <div v-if="!records.length" class="flex grow items-center justify-center">
        <div class="text-xl opacity-70 whitespace-nowrap">No profiles yet!</div>
      </div>
      <div v-else class="grow">
        <table>
          <thead class="sticky top-0">
            <tr>
              <th>Profile</th>
              <th>#Notes</th>
              <th>Created at</th>
              <th>Last access</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="profile in records"
              class="cursor-pointer"
              :class="{ selected: profile === selected }"
              @click="selectRow(profile)"
            >
              <td>{{ profile.name }}</td>
              <td>{{ profile.notes }}</td>
              <td>{{ parseTimestamp(profile.createdAt) }}</td>
              <td>{{ parseTimestamp(profile.lastAccess) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <footer class="flex p-2">
      <div class="flex grow gap-1 justify-center">
        <button type="button" class="btn-primary" @click="openCreateModal">Create</button>
        <button type="button" class="btn-primary" @click="login" :disabled="!selected">
          Select
        </button>
        <button type="button" class="btn-primary" :disabled="!selected" @click="startRename">
          Rename
        </button>
        <button
          type="button"
          class="btn-primary"
          :disabled="!selected"
          @click="modals.delete = true"
        >
          Delete
        </button>
      </div>
    </footer>
  </div>
</template>
