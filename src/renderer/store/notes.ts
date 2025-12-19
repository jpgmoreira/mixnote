import { defineStore } from 'pinia';
import { toRaw } from 'vue';
import { EventEmitter } from '@common/events/eventEmitter';
import { Events } from '@renderer/events';
import { StartupDTO } from '@common/dto/startupDTO';
import { TabGroup } from '@common/schemas/tabs';
import { InvokeChannels } from '@preload/channels/invoke';

EventEmitter.instance.on(Events.loadStartupData, (data: StartupDTO) => {
  useNotesStore().initData(data);
});

EventEmitter.instance.on(Events.clearProfileData, () => {
  useNotesStore().clear();
});

/**
 * In the back-end there is a separate manager for the notes and for the tabs.
 * Here I keep both data in the same store to simplify the use.
 */
export const useNotesStore = defineStore('notes', {
  state: () => ({
    tabGroups: null as TabGroup[] | null,
    tabGroupsTimer: undefined as ReturnType<typeof setTimeout> | undefined,
  }),
  actions: {
    initData(data: StartupDTO) {
      this.tabGroups = data.tabGroups;
    },
    clear() {
      this.tabGroups = null;
    },
    tabGroupsUpdated() {
      clearTimeout(this.tabGroupsTimer);
      this.tabGroupsTimer = setTimeout(() => {
        window.api.invoke(InvokeChannels.updateTabGroups, toRaw(this.tabGroups));
      }, 500);
    },
  },
});
