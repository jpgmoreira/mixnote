import { FileProxy } from '../fileProxy';
import path from 'path';
import { DATA_DIR } from '@main/constants';
import { ensureDirExists } from '@main/utils/utils';
import { getEmptyNote, Note, NoteFrequency } from '@common/schemas/note';
import { ProfileManager } from './profileManager';
import fs from 'fs';
import { TabsManager } from './tabsManager';
import { TreeManager } from './treeManager';
import { shuffleArray } from '@common/utils/utils';

/**
 * Singleton for managing notes.
 * Access via NotesManager.instance
 */
export class NotesManager {
  static #instance: NotesManager;
  private profileId: string | null = null;

  private constructor() {}

  private filteredIds: string[] = [];
  private indexes: Record<NoteFrequency, number> = {
    high: -1,
    low: -1,
    normal: -1,
  };
  private highIds: Set<string> = new Set();
  private lowIds: Set<string> = new Set();

  public static get instance(): NotesManager {
    if (!this.#instance) {
      this.#instance = new NotesManager();
    }
    return this.#instance;
  }

  private resetData() {
    this.filteredIds = [];
    this.indexes = {
      high: -1,
      low: -1,
      normal: -1,
    };
    this.highIds.clear();
    this.lowIds.clear();
  }

  public loadProfile(profileId: string) {
    this.profileId = profileId;
    this.resetData();
  }

  public createNote(title: string): string {
    if (!this.profileId) throw new Error('Profile not initialized.');
    const now = Date.now();
    const note = getEmptyNote(title, now);
    const dirPath = path.join(DATA_DIR, 'profileData', this.profileId, 'notes');
    ensureDirExists(dirPath);
    const fPath = path.join(dirPath, `${note.id}.json`);
    new FileProxy(fPath, note);
    ProfileManager.instance.addNotes(1);
    return note.id;
  }

  public async getNote(noteId: string): Promise<Note> {
    if (!this.profileId) throw new Error('Profile not initialized!');
    const fPath = path.join(DATA_DIR, 'profileData', this.profileId, 'notes', `${noteId}.json`);
    if (!fs.existsSync(fPath)) {
      throw new Error(`Note does not exist!: ${noteId}`);
    }
    const content = await fs.promises.readFile(fPath, 'utf-8');
    const note = JSON.parse(content) as Note;
    return note;
  }

  public async updateNoteContent(
    noteId: string,
    field: 'head' | 'body',
    content: string,
    timestamp: number
  ) {
    if (!this.profileId) throw new Error('Profile not initialized!');
    const fPath = path.join(DATA_DIR, 'profileData', this.profileId, 'notes', `${noteId}.json`);
    const note = await this.getNote(noteId);
    note[field] = content;
    note.lastModified = timestamp;
    await fs.promises.writeFile(fPath, JSON.stringify(note), 'utf-8');
  }

  public async renameNote(noteId: string, newName: string) {
    if (!this.profileId) throw new Error('Profile not initialized!');
    const fPath = path.join(DATA_DIR, 'profileData', this.profileId, 'notes', `${noteId}.json`);
    const note = await this.getNote(noteId);
    note.title = newName;
    await fs.promises.writeFile(fPath, JSON.stringify(note), 'utf-8');
  }

  public async deleteNote(noteId: string) {
    if (!this.profileId) throw new Error('Profile not initialized!');
    const fPath = path.join(DATA_DIR, 'profileData', this.profileId, 'notes', `${noteId}.json`);
    if (!fs.existsSync(fPath)) {
      throw new Error(`Note does not exist!: ${noteId}`);
    }
    await fs.promises.unlink(fPath);
    ProfileManager.instance.addNotes(-1);
    TabsManager.instance.noteDeleted(noteId);
  }

  private canChooseFrequency(frequency: NoteFrequency): boolean {
    if (frequency === 'high') return this.highIds.size > 0;
    if (frequency === 'low') return this.lowIds.size > 0;
    return this.filteredIds.length > this.highIds.size + this.lowIds.size;
  }

  public async getNextFlashcard(): Promise<Note | null> {
    if (!this.filteredIds.length) return null;
    // TODO: Update to use probabilities from user settings.
    let frequency: NoteFrequency = 'normal';
    do {
      const prob = Math.random();
      if (prob < 0.3) frequency = 'high';
      else if (prob < 0.3 + 0.1) frequency = 'low';
      else frequency = 'normal';
    } while (!this.canChooseFrequency(frequency));
    let verifier = (noteId: string) => !this.lowIds.has(noteId) && !this.highIds.has(noteId);
    if (frequency === 'low') {
      verifier = (noteId: string) => this.lowIds.has(noteId);
    } else if (frequency === 'high') {
      verifier = (noteId: string) => this.highIds.has(noteId);
    }
    let noteId = this.filteredIds[0];
    do {
      this.indexes[frequency] = (this.indexes[frequency] + 1) % this.filteredIds.length;
      noteId = this.filteredIds[this.indexes[frequency]];
      if (frequency === 'normal' && this.indexes[frequency] === 0) {
        shuffleArray(this.filteredIds);
      }
    } while (!verifier(noteId));
    return this.getNote(noteId);
  }

  public async flashcardsFilter(isStart: boolean): Promise<Note | null> {
    const noteIds = TreeManager.instance.getSelectedNotes();
    this.filteredIds = noteIds;
    if (isStart) {
      this.indexes = {
        high: -1,
        low: -1,
        normal: -1,
      };
      this.highIds.clear();
      this.lowIds.clear();
    }
    return this.getNextFlashcard();
  }

  public clear() {
    this.profileId = null;
    this.resetData();
  }
}
