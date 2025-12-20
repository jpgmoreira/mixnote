import { defineStore } from 'pinia';
import { toRaw } from 'vue';
import { EventEmitter } from '@common/events/eventEmitter';
import { Events } from '@renderer/events';
import { StartupDTO } from '@common/dto/startupDTO';
import { getEmptyTabGroup, TabGroup } from '@common/schemas/tabs';
import { InvokeChannels } from '@preload/channels/invoke';
import { Note } from '@common/schemas/note';
import { randomId } from '@common/utils/utils';

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
    notes: {} as Record<string, Note>,
    tabGroups: null as TabGroup[] | null,
    tabGroupsTimer: undefined as ReturnType<typeof setTimeout> | undefined,
  }),
  actions: {
    initData(data: StartupDTO) {
      this.tabGroups = data.tabGroups;
      // TODO: Fetch initially open notes here.
    },
    clear() {
      this.tabGroups = null;
      this.notes = {};
    },
    updateTabGroups() {
      clearTimeout(this.tabGroupsTimer);
      this.tabGroupsTimer = setTimeout(() => {
        window.api.invoke(InvokeChannels.updateTabGroups, toRaw(this.tabGroups));
      }, 500);
    },
    async explorerNoteClicked(noteId: string) {
      if (!this.tabGroups || !this.tabGroups.length) {
        throw new Error('No tab groups!');
      }
      // 1. If the note is not in the front, request it from the back:
      if (!(noteId in this.notes)) {
        const note = await window.api.invoke<Note>(InvokeChannels.getNote, noteId);
        this.notes[noteId] = note;
      }
      // 2. Verify if the note is already open in the current tab group:
      let activeGroup = this.tabGroups.find((g) => g.active);
      if (!activeGroup) {
        activeGroup = this.tabGroups[0];
        activeGroup.active = true;
      }
      const tab = activeGroup.tabs.find((tab) => tab.noteId === noteId);
      if (tab) {
        activeGroup.activeTab = tab.id;
        return;
      }
      // 3. Open it in a preview tab in the current tab group.
      let previewTab = activeGroup.tabs.find((tab) => tab.preview);
      if (!previewTab) {
        const tabId = randomId();
        previewTab = {
          id: tabId,
          noteId,
          preview: true,
        };
        activeGroup.tabs.push(previewTab);
      }
      previewTab.noteId = noteId;
      activeGroup.activeTab = previewTab.id;
    },
  },
});
