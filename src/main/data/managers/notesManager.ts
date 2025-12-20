import { FileProxy } from '../fileProxy';
import path from 'path';
import { DATA_DIR } from '@main/constants';
import { ensureDirExists } from '@main/utils/utils';
import { getEmptyNote, Note } from '@common/schemas/note';
import { ProfileManager } from './profileManager';
import fs from 'fs';

/**
 * Singleton for managing notes.
 * Access via NotesManager.instance
 */
export class NotesManager {
  static #instance: NotesManager;
  private profileId: string | null = null;

  private constructor() {}

  public static get instance(): NotesManager {
    if (!this.#instance) {
      this.#instance = new NotesManager();
    }
    return this.#instance;
  }

  public loadProfile(profileId: string) {
    this.profileId = profileId;
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
    const json = JSON.parse(content) as Note;
    return json;
  }

  public clear() {
    this.profileId = null;
  }
}
