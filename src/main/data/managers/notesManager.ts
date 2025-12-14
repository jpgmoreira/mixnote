import { FileProxy } from '../fileProxy';
import path from 'path';
import { DATA_DIR } from '@main/constants';
import { getEmptyUISettings, UISettings } from '@common/schemas/ui';
import { buildId } from '@common/utils/utils';
import { ensureDirExists } from '@main/utils/utils';
import { getEmptyNote } from '@common/schemas/note';
import { ProfileManager } from './profileManager';

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

  public clear() {
    this.profileId = null;
  }
}
