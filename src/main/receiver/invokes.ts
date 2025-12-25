import { ProfileManager } from '@main/data/managers/profileManager';
import { loadStartupData } from '@main/data/startup';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { InvokeChannels } from '@preload/channels/invoke';
import { AuthResponseDTO } from '@common/dto/authResponseDTO';
import { GenericResponseDTO } from '@common/dto/genericResponseDTO';
import { UISettings } from '@common/schemas/ui';
import { UIManager } from '@main/data/managers/uiManager';
import { TabGroup } from '@common/schemas/tabs';
import { TabsManager } from '@main/data/managers/tabsManager';
import { Note, NoteFrequency } from '@common/schemas/note';
import { NotesManager } from '@main/data/managers/notesManager';
import { TreeManager } from '@main/data/managers/treeManager';
import { sleep } from '@common/utils/utils';

ipcMain.handle(
  InvokeChannels.createProfile,
  async (_: IpcMainInvokeEvent, name: string): Promise<AuthResponseDTO> => {
    const result = ProfileManager.instance.createProfile(name);
    if (result.status === 'error') {
      return result;
    }
    const data = await loadStartupData();
    return {
      status: 'success',
      data,
    };
  }
);

ipcMain.handle(
  InvokeChannels.renameProfile,
  async (_: IpcMainInvokeEvent, profileId: string, name: string): Promise<GenericResponseDTO> =>
    ProfileManager.instance.renameProfile(profileId, name)
);

ipcMain.handle(
  InvokeChannels.deleteProfile,
  async (_: IpcMainInvokeEvent, profileId: string): Promise<GenericResponseDTO> => {
    await sleep(5000);
    return ProfileManager.instance.deleteProfile(profileId);
  }
);

ipcMain.handle(
  InvokeChannels.login,
  async (_: IpcMainInvokeEvent, profileId: string): Promise<AuthResponseDTO> => {
    ProfileManager.instance.login(profileId);
    const data = await loadStartupData();
    const result: AuthResponseDTO = {
      status: 'success',
      data,
    };
    return result;
  }
);

ipcMain.handle(InvokeChannels.logout, async (_: IpcMainInvokeEvent): Promise<AuthResponseDTO> => {
  ProfileManager.instance.logout();
  const data = await loadStartupData();
  const result: AuthResponseDTO = {
    status: 'success',
    data,
  };
  return result;
});

ipcMain.handle(
  InvokeChannels.updateUISettings,
  async (_: IpcMainInvokeEvent, settings: UISettings) => {
    UIManager.instance.setUISettings(settings);
  }
);

ipcMain.handle(
  InvokeChannels.updateTabGroups,
  async (_: IpcMainInvokeEvent, groups: TabGroup[]) => {
    TabsManager.instance.updateGroups(groups);
  }
);

ipcMain.handle(
  InvokeChannels.getNote,
  async (_: IpcMainInvokeEvent, noteId: string): Promise<Note> => {
    return NotesManager.instance.getNote(noteId);
  }
);

ipcMain.handle(InvokeChannels.deleteNote, async (_: IpcMainInvokeEvent, noteId: string) => {
  await sleep(2000);
  TreeManager.instance.noteWasDeleted(noteId);
});

ipcMain.handle(
  InvokeChannels.updateNoteField,
  async (
    _: IpcMainInvokeEvent,
    noteId: string,
    field: 'head' | 'body',
    content: string,
    timestamp: number
  ) => {
    NotesManager.instance.updateNoteField(noteId, field, content, timestamp);
  }
);

ipcMain.handle(InvokeChannels.updateNote, async (_: IpcMainInvokeEvent, note: Note) => {
  NotesManager.instance.updateNote(note);
});

ipcMain.handle(
  InvokeChannels.renameNote,
  async (_: IpcMainInvokeEvent, noteId: string, newName: string) => {
    NotesManager.instance.renameNote(noteId, newName);
  }
);

ipcMain.handle(InvokeChannels.getTabGroups, async (_: IpcMainInvokeEvent): Promise<TabGroup[]> => {
  return TabsManager.instance.getGroups();
});

ipcMain.handle(
  InvokeChannels.flashcardsFilter,
  async (_: IpcMainInvokeEvent, isStart: boolean): Promise<Note | null> => {
    return NotesManager.instance.flashcardsFilter(isStart);
  }
);

ipcMain.handle(
  InvokeChannels.getNextFlashcard,
  async (_: IpcMainInvokeEvent): Promise<Note | null> => {
    return NotesManager.instance.getNextFlashcard();
  }
);

ipcMain.handle(
  InvokeChannels.setNoteFrequency,
  async (_: IpcMainInvokeEvent, noteId: string, frequency: NoteFrequency) => {
    NotesManager.instance.setNoteFrequency(noteId, frequency);
  }
);
