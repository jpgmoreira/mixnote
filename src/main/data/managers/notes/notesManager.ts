import { FileProxy } from '../../fileProxy';
import path from 'path';
import { DATA_DIR } from '@main/constants';
import { ensureDirExists } from '@main/utils/utils';
import { EventEmitter } from '@common/events/eventEmitter';
import { Events } from '@main/events/events';
import {
  getEmptyNote,
  Note,
  NoteFrequency,
  NoteStatistics,
  sanitizeNote,
} from '@common/schemas/note';
import { ProfileManager } from '../profileManager';
import fs from 'fs';
import { TabsManager } from '../tabsManager';
import { TreeManager } from '../treeManager';
import { shuffleArray } from '@common/utils/utils';
import { ConfigManager } from '../configManager';
import { NotesImgManager } from './notesImgManager';

EventEmitter.instance.on(Events.clearProfileData, () => {
  NotesManager.instance.clear();
});

type ReviewBucketType = {
  string: boolean;
};

/**
 * Singleton for managing notes.
 * Access via NotesManager.instance
 */
export class NotesManager {
  static #instance: NotesManager;

  private _reviewBucketProxy: FileProxy<ReviewBucketType> | null = null;
  private profileId: string | null = null;

  private get reviewBucket() {
    return this._reviewBucketProxy?.proxy || null;
  }

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
    const bucketPath = path.join(DATA_DIR, 'profileData', profileId, 'reviewBucket.json');
    this._reviewBucketProxy = new FileProxy(bucketPath, {} as ReviewBucketType);
    NotesImgManager.instance.loadProfile(profileId);
    this.resetData();
  }

  public createNote(title: string): string {
    if (!this.profileId) throw new Error('Profile not initialized.');
    const now = Date.now();
    const note = getEmptyNote(title, now);
    const dirPath = path.join(DATA_DIR, 'profileData', this.profileId, 'notes', note.id);
    ensureDirExists(dirPath);
    const fPath = path.join(dirPath, `${note.id}.json`);
    new FileProxy(fPath, note);
    ProfileManager.instance.addNotes(1);
    return note.id;
  }

  public async getNote(noteId: string): Promise<Note> {
    if (!this.profileId) throw new Error('Profile not initialized!');
    if (!this.reviewBucket) throw new Error('Review bucket not initialized!');
    const fPath = path.join(
      DATA_DIR,
      'profileData',
      this.profileId,
      'notes',
      noteId,
      `${noteId}.json`
    );
    if (!fs.existsSync(fPath)) {
      throw new Error(`Note does not exist!: ${noteId}`);
    }
    const content = await fs.promises.readFile(fPath, 'utf-8');
    const note = JSON.parse(content) as Note;
    note.frequency = 'normal';
    note.reviewBucket = false;
    if (this.lowIds.has(noteId)) note.frequency = 'low';
    if (this.highIds.has(noteId)) note.frequency = 'high';
    if (noteId in this.reviewBucket) note.reviewBucket = true;
    NotesImgManager.instance.setNoteImagesAsSafeFile(note);
    return note;
  }

  public async updateNote(note: Note) {
    if (!this.profileId) throw new Error('Profile not initialized!');
    sanitizeNote(note);
    NotesImgManager.instance.setNoteImagesAsHash(note);
    const fPath = path.join(
      DATA_DIR,
      'profileData',
      this.profileId,
      'notes',
      note.id,
      `${note.id}.json`
    );
    await fs.promises.writeFile(fPath, JSON.stringify(note), 'utf-8');
  }

  public async renameNote(noteId: string, newName: string) {
    if (!this.profileId) throw new Error('Profile not initialized!');
    const fPath = path.join(
      DATA_DIR,
      'profileData',
      this.profileId,
      'notes',
      noteId,
      `${noteId}.json`
    );
    const note = await this.getNote(noteId);
    note.title = newName;
    await fs.promises.writeFile(fPath, JSON.stringify(note), 'utf-8');
  }

  public async deleteNote(noteId: string) {
    if (!this.profileId) throw new Error('Profile not initialized!');
    const dirPath = path.join(DATA_DIR, 'profileData', this.profileId, 'notes', noteId);
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Note does not exist!: ${noteId}`);
    }
    await fs.promises.rm(dirPath, { recursive: true, force: true });
    ProfileManager.instance.addNotes(-1);
    TabsManager.instance.noteDeleted(noteId);
    this.filteredIds = this.filteredIds.filter((id) => id !== noteId);
    this.highIds.delete(noteId);
    this.lowIds.delete(noteId);
    delete this.reviewBucket![noteId];
  }

  private canChooseFrequency(frequency: NoteFrequency): boolean {
    if (frequency === 'high') return this.highIds.size > 0;
    if (frequency === 'low') return this.lowIds.size > 0;
    return this.filteredIds.length > this.highIds.size + this.lowIds.size;
  }

  public async getNextFlashcard(): Promise<Note | null> {
    if (!this.filteredIds.length) return null;
    const { lfProbability, hfProbability } = ConfigManager.instance.getConfig();
    let frequency: NoteFrequency = 'normal';
    do {
      const prob = Math.random();
      if (prob < hfProbability) frequency = 'high';
      else if (prob < hfProbability + lfProbability) frequency = 'low';
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
      if (frequency === 'normal' && this.indexes[frequency] === 0) {
        shuffleArray(this.filteredIds);
      }
      noteId = this.filteredIds[this.indexes[frequency]];
    } while (!verifier(noteId));
    const note = await this.getNote(noteId);
    return note;
  }

  public async flashcardsFilter(isStart: boolean): Promise<Note | null> {
    if (!this.reviewBucket) throw new Error('Review bucket not initialized!');
    let noteIds = TreeManager.instance.getSelectedNotes();
    const { reviewBucket } = ConfigManager.instance.getConfig();
    noteIds = noteIds.filter((nid) => {
      if (reviewBucket.includes('yes') && nid in this.reviewBucket!) return true;
      if (reviewBucket.includes('no') && !(nid in this.reviewBucket!)) return true;
      return false;
    });
    this.filteredIds = noteIds;
    if (isStart) {
      this.indexes = {
        high: -1,
        low: -1,
        normal: -1,
      };
      this.highIds.clear();
      this.lowIds.clear();
      return this.getNextFlashcard();
    }
    return null;
  }

  public async fetchNoteStatistics(): Promise<NoteStatistics> {
    const selected = TreeManager.instance.getSelectedNotes();
    const total = TreeManager.instance.getNFiles();
    await this.flashcardsFilter(false);
    return {
      total,
      reviewBucketTotal: Object.keys(this.reviewBucket!).length,
      selected: selected.length,
      filtered: this.filteredIds.length,
    };
  }

  public setNoteFrequency(noteId: string, frequency: NoteFrequency) {
    this.highIds.delete(noteId);
    this.lowIds.delete(noteId);
    if (frequency === 'normal') return;
    if (frequency === 'high') this.highIds.add(noteId);
    if (frequency === 'low') this.lowIds.add(noteId);
  }

  public toggleNoteReviewBucket(noteId: string) {
    if (!this.reviewBucket) throw new Error('Review bucket not initialized!');
    if (noteId in this.reviewBucket) delete this.reviewBucket[noteId];
    else this.reviewBucket[noteId] = true;
  }

  public clear() {
    this.profileId = null;
    NotesImgManager.instance.clear();
    this.resetData();
  }
}
