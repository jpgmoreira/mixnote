import { defineStore } from 'pinia';
import { EventEmitter } from '@common/events/eventEmitter';
import { Events } from '@renderer/events';
import { StartupDTO } from '@common/dto/startupDTO';
import { Tab, TabGroup } from '@common/schemas/tabs';
import { InvokeChannels } from '@preload/channels/invoke';
import { Note, NoteStatistics } from '@common/schemas/note';
import { randomId, toRawDeep } from '@common/utils/utils';

EventEmitter.instance.on(Events.loadStartupData, (data: StartupDTO) => {
  useNotesStore().initData(data);
});

EventEmitter.instance.on(Events.clearProfileData, () => {
  useNotesStore().clear();
});

/**
 * In the back-end there is a separate manager for the notes and for the tabs.
 * Here I keep both data in the same store to simplify the use.
 * The logic is split between this Pinia store and the NotesView component.
 */
export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: {} as Record<string, Note>,
    nSelectedNotes: 0,
    nFilteredNotes: 0,
    tabGroups: null as TabGroup[] | null,
    tabGroupsTimer: undefined as ReturnType<typeof setTimeout> | undefined,
  }),
  actions: {
    initData(data: StartupDTO) {
      this.tabGroups = data.tabGroups;
      if (this.tabGroups) {
        for (const group of this.tabGroups) {
          for (const tab of group.tabs) {
            this.getNote(tab.noteId, true);
          }
        }
      }
    },
    clear() {
      this.tabGroups = null;
      this.notes = {};
      this.nSelectedNotes = 0;
      this.nFilteredNotes = 0;
    },
    updateTabGroups() {
      clearTimeout(this.tabGroupsTimer);
      this.tabGroupsTimer = setTimeout(() => {
        window.api.invoke(InvokeChannels.updateTabGroups, toRawDeep(this.tabGroups));
      }, 500);
    },
    async getNote(noteId: string, saveToCache: boolean) {
      if (noteId in this.notes) return this.notes[noteId];
      const note = await window.api.invoke<Note>(InvokeChannels.getNote, noteId);
      if (saveToCache) this.notes[noteId] = note;
      return note;
    },
    setActiveTab(group: TabGroup, tabId: string) {
      group.tabs.forEach((tab) => (tab.active = tab.id === tabId));
    },
    getTabTitle(tab: Tab) {
      const note = this.notes[tab.noteId];
      return note?.title || '';
    },
    hasActiveNote(group: TabGroup) {
      const activeTab = group.tabs.find((tab) => tab.active);
      if (!activeTab) return false;
      return Boolean(this.notes[activeTab.noteId]);
    },
    tabHeaderClick(group: TabGroup, tabId: string) {
      const tab = group.tabs.find((tab) => tab.id === tabId);
      if (!tab) return;
      group.tabs.forEach((tab) => (tab.active = tab.id === tabId));
      tab.preview = false;
    },
    getActiveNote(group: TabGroup) {
      const activeTab = group.tabs.find((tab) => tab.active);
      if (!activeTab) return null;
      return this.notes[activeTab.noteId] || null;
    },
    closeTab(group: TabGroup, tabId: string) {
      if (!this.tabGroups) throw new Error('No tab groups!');
      const tab = group.tabs.find((t) => t.id === tabId);
      if (!tab) throw new Error('Tab not found!');
      const noteId = tab.noteId;
      group.tabs = group.tabs.filter((t) => t.id !== tabId);
      for (const group of this.tabGroups) {
        for (const tab of group.tabs) {
          if (tab.noteId === noteId) {
            return;
          }
        }
      }
      delete this.notes[noteId];
    },
    updateNoteField(noteId: string, field: 'head' | 'body', content: string) {
      // Should be debounced somewhere else.
      if (!(noteId in this.notes)) throw new Error('Cannot update non-existing note!');
      const now = Date.now();
      const note = this.notes[noteId];
      note[field] = content;
      note.lastModified = now;
      window.api.invoke(InvokeChannels.updateNoteField, noteId, field, content, now);
    },
    updateNote(note: Note) {
      note.lastModified = Date.now(); // Will reflect in the caller.
      const clone = structuredClone(toRawDeep(note));
      if (note.id in this.notes) this.notes[note.id] = clone;
      window.api.invoke(InvokeChannels.updateNote, clone);
    },
    async fetchNoteStatistics() {
      const result = await window.api.invoke<NoteStatistics>(InvokeChannels.fetchNoteStatistics);
      this.nSelectedNotes = result.selected;
      this.nFilteredNotes = result.filtered;
    },
    async toggleNoteReviewBucket(noteId: string) {
      const note = this.notes[noteId];
      if (note) note.reviewBucket = !note.reviewBucket;
      await window.api.invoke(InvokeChannels.toggleNoteReviewBucket, noteId);
    },
    async refreshTabs() {
      this.tabGroups = await window.api.invoke<TabGroup[]>(InvokeChannels.getTabGroups);
      const ids = new Set<string>();
      for (const group of this.tabGroups) {
        for (const tab of group.tabs) {
          ids.add(tab.noteId);
        }
      }
      for (const noteId of Object.keys(this.notes)) {
        if (!ids.has(noteId)) {
          delete this.notes[noteId];
        }
      }
    },
    async renameNote(noteId: string, newName: string) {
      await window.api.invoke(InvokeChannels.renameNote, noteId, newName);
      if (noteId in this.notes) {
        const note = this.notes[noteId];
        note.title = newName;
      }
    },
    async explorerNoteClicked(noteId: string) {
      if (!this.tabGroups || !this.tabGroups.length) {
        throw new Error('No tab groups!');
      }
      // 1. If the note is not in the front, request it from the back:
      await this.getNote(noteId, true);
      // 2. Verify if the note is already open in the current tab group:
      let activeGroup = this.tabGroups.find((g) => g.active);
      if (!activeGroup) {
        activeGroup = this.tabGroups[0];
        activeGroup.active = true;
      }
      const tab = activeGroup.tabs.find((tab) => tab.noteId === noteId);
      if (tab) {
        this.setActiveTab(activeGroup, tab.id);
        tab.preview = false;
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
          active: true,
        };
        activeGroup.tabs.push(previewTab);
      }
      previewTab.noteId = noteId;
      this.setActiveTab(activeGroup, previewTab.id);
    },
  },
});
